
// src/services/ragService.ts
// RAG (Retrieval-Augmented Generation) Service for Internal Knowledge Base
// Uses Vercel AI SDK for Embedding and Drizzle ORM pgvector for semantic search

import { db } from '@/db';
import { documents } from '@/db/schema';
import { AiService } from '@/services/aiService';
import { eq, and, sql, desc, cosineDistance } from 'drizzle-orm';

export const RAGService = {
  /**
   * Upload and embed a document
   */
  async uploadDocument(teamId: string, title: string, content: string): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      if (!content || content.length < 10) {
        return { success: false, error: 'Document content too short (minimum 10 characters)' };
      }

      // Generate embedding for the document
      const embedding = await AiService.generateEmbedding(content);

      if (!embedding || embedding.length === 0) {
        return { success: false, error: 'Failed to generate embedding' };
      }

      // Store document with embedding in database
      // Drizzle vector support: generic sql or specific helper
      const [doc] = await db.insert(documents).values({
          teamId,
          title,
          content,
          embedding: embedding, // Drizzle handles number[] to vector if type is defined
          createdAt: new Date()
      }).returning();
      
      console.log(`[RAG] Document uploaded and embedded for team ${teamId}: ${title}`);
      
      return { 
        success: true,
        documentId: doc.id
      };

    } catch (error) {
      console.error('[RAG] Upload document error:', error);
      return { success: false, error: String(error) };
    }
  },

  /**
   * Search for relevant documents using vector similarity
   */
  async searchDocuments(
    teamId: string, 
    query: string, 
    limit: number = 5
  ): Promise<Array<{ id: string; title: string; content: string | null; similarity: number }>> {
    try {
      // Generate embedding for the query
      const embedding = await AiService.generateEmbedding(query);

      if (!embedding) {
        console.error('[RAG] Failed to generate query embedding');
        return [];
      }

      const similarity = sql<number>`1 - (${documents.embedding} <=> ${JSON.stringify(embedding)}::vector)`;

      const results = await db.select({
          id: documents.id,
          title: documents.title,
          content: documents.content,
          similarity: similarity
      })
      .from(documents)
      .where(and(eq(documents.teamId, teamId)))
      .orderBy(desc(similarity))
      .limit(limit);

      console.log(`[RAG] Found ${results.length} relevant documents for query: "${query.substring(0, 50)}..."`);
      
      return results;

    } catch (error) {
      console.error('[RAG] Search error:', error);
      return [];
    }
  },

  /**
   * Get relevant context for AI chat
   * This assembles the best matching documents to feed into the AI prompt
   */
  async getContext(teamId: string, userQuery: string, maxChars: number = 4000): Promise<string> {
    try {
      const docs = await this.searchDocuments(teamId, userQuery, 3);

      if (docs.length === 0) {
        return 'No relevant internal documents found.';
      }

      // Build context from top matching documents
      let context = '=== INTERNAL KNOWLEDGE BASE ===\n\n';
      let charCount = 0;

      for (const doc of docs) {
        const docText = `[Document: ${doc.title}]\n${doc.content}\n\n`;
        
        if (charCount + docText.length > maxChars) {
          break;
        }

        context += docText;
        charCount += docText.length;
      }

      return context;

    } catch (error) {
      console.error('[RAG] Get context error:', error);
      return '';
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const result = await db.delete(documents)
            .where(and(eq(documents.id, documentId), eq(documents.teamId, teamId)))
            .returning();

      if (result.length === 0) {
        return { success: false, error: 'Document not found or access denied' };
      }

      console.log(`[RAG] Document deleted: ${documentId}`);
      return { success: true };

    } catch (error) {
      console.error('[RAG] Delete document error:', error);
      return { success: false, error: String(error) };
    }
  },

  /**
   * List all documents for a team
   */
  async listDocuments(teamId: string): Promise<Array<{ id: string; title: string; createdAt: Date | null }>> {
    try {
      const docs = await db.query.documents.findMany({
        where: eq(documents.teamId, teamId),
        orderBy: desc(documents.createdAt),
        columns: {
            id: true,
            title: true,
            createdAt: true
        }
      });

      return docs;

    } catch (error) {
      console.error('[RAG] List documents error:', error);
      return [];
    }
  },

  /**
   * Get document by ID
   */
  async getDocument(documentId: string, teamId: string) {
     try {
      const doc = await db.query.documents.findFirst({
        where: and(eq(documents.id, documentId), eq(documents.teamId, teamId))
      });
      return doc;
    } catch (error) {
      console.error('[RAG] Get document error:', error);
      return null;
    }
  }
};
