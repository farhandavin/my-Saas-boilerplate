
import { db } from '@/db';
import { documents } from '@/db/schema';
import { AiService } from '@/services/aiService';
import { AuditLogService } from '@/services/auditLogService';
import { eq, desc, ilike, and, sql } from 'drizzle-orm';

export const DocumentService = {
  /**
   * Get paginated documents for a team with search and sorting
   */
  async getDocuments(
    teamId: string,
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ) {
    const offset = (page - 1) * pageSize;

    // Build where condition
    let whereCondition = eq(documents.teamId, teamId);
    if (search) {
      whereCondition = and(
        whereCondition,
        ilike(documents.title, `%${search}%`)
      )!;
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(whereCondition);
    
    const totalItems = Number(countResult.count);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated data
    const data = await db
      .select({
        id: documents.id,
        title: documents.title,
        content: documents.content, // Maybe truncate this for list view if too large?
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(whereCondition)
      .orderBy(desc(documents.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      metadata: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize
      }
    };
  },

  /**
   * Get a single document by ID
   */
  async getDocumentById(id: string, teamId: string) {
    const doc = await db.query.documents.findFirst({
      where: and(eq(documents.id, id), eq(documents.teamId, teamId))
    });
    return doc;
  },

  /**
   * Create a new document with embedding and audit log
   */
  async createDocument(
    teamId: string, 
    userId: string, // Required for audit log
    title: string, 
    content: string
  ) {
    const embedding = await AiService.generateEmbedding(content);

    const [newDoc] = await db.insert(documents).values({
      teamId,
      title,
      content,
      embedding: sql`${JSON.stringify(embedding)}::vector`
    }).returning();

    // Audit Log
    await AuditLogService.log({
      teamId,
      userId,
      action: 'DOCUMENT_CREATED',
      resource: 'Document',
      details: `Created document: ${title}`,
      metadata: { newData: { id: newDoc.id, title, content } }
    });

    return newDoc;
  },

  /**
   * Update a document with auto-re-embedding and diff audit log
   */
  async updateDocument(
    id: string,
    teamId: string,
    userId: string,
    data: { title?: string; content?: string }
  ) {
    // 1. Fetch existing for Diff
    const oldDoc = await this.getDocumentById(id, teamId);
    if (!oldDoc) throw new Error('Document not found');

    const updateData: any = { ...data };

    // 2. Re-embed if content changed
    if (data.content && data.content !== oldDoc.content) {
      const embedding = await AiService.generateEmbedding(data.content);
      updateData.embedding = embedding;
    }

    // 3. Perform Update
    const [updatedDoc] = await db.update(documents)
      .set({
        ...updateData,
        embedding: updateData.embedding ? sql`${JSON.stringify(updateData.embedding)}::vector` : undefined
      })
      .where(and(eq(documents.id, id), eq(documents.teamId, teamId)))
      .returning();

    // 4. Calculate Diff for Audit Log
    const changes: Record<string, any> = {};
    if (data.title && data.title !== oldDoc.title) changes.title = { from: oldDoc.title, to: data.title };
    if (data.content && data.content !== oldDoc.content) changes.content = { from: '...', to: '...' }; // Content might be too large to log fully

    // 5. Audit Log
    await AuditLogService.log({
      teamId,
      userId,
      action: 'DOCUMENT_UPDATED',
      resource: 'Document',
      details: `Updated document: ${updatedDoc.title}`,
      metadata: { 
        documentId: id,
        changes,
        oldData: { title: oldDoc.title }, // Snapshot important fields
        newData: { title: updatedDoc.title }
      }
    });

    return updatedDoc;
  },

  /**
   * Delete a document with audit log
   */
  async deleteDocument(id: string, teamId: string, userId: string) {
    const oldDoc = await this.getDocumentById(id, teamId);
    if (!oldDoc) throw new Error('Document not found');

    await db.delete(documents)
      .where(and(eq(documents.id, id), eq(documents.teamId, teamId)));

    await AuditLogService.log({
      teamId,
      userId,
      action: 'DOCUMENT_DELETED',
      resource: 'Document',
      details: `Deleted document: ${oldDoc.title}`,
      metadata: { 
        deletedData: { id: oldDoc.id, title: oldDoc.title, createdAt: oldDoc.createdAt }
      }
    });

    return true;
  },

  /**
   * RAG: Find relevant context
   */
  async findRelevantContext(teamId: string, queryText: string): Promise<string> {
    const queryEmbedding = await AiService.generateEmbedding(queryText);
    const vectorStr = `[${queryEmbedding.join(',')}]`;

    const result = await db.select({
      title: documents.title,
      content: documents.content,
      similarity: sql<number>`1 - (${documents.embedding} <=> ${vectorStr}::vector)`
    })
    .from(documents)
    .where(eq(documents.teamId, teamId))
    .orderBy(desc(sql`1 - (${documents.embedding} <=> ${vectorStr}::vector)`))
    .limit(3);

    return result.map((d) => `[Source: ${d.title}]\n${d.content}`).join("\n\n");
  }
};