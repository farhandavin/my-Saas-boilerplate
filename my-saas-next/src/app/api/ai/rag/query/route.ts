// src/app/api/ai/rag/query/route.ts
// API endpoint for querying RAG knowledge base

import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/services/ragService';
import { AiService } from '@/services/aiService';
import { PiiService } from '@/services/piiService';
import { getAuthUser } from '@/lib/middleware/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Mask PII before processing
    const maskedQuery = PiiService.mask(query);

    // Get relevant context from knowledge base
    const context = await RAGService.getContext(auth.teamId, maskedQuery);

    // Build prompt with context
    const prompt = `
You are an AI assistant for a business. Answer the following question based ONLY on the internal knowledge base provided.

${context}

Question: ${maskedQuery}

Instructions:
- Only use information from the knowledge base above
- If the answer is not in the knowledge base, say "I don't have that information in the knowledge base"
- Be concise and accurate
- Cite which document you're referencing if possible
    `.trim();

    // Generate AI response
    const response = await AiService.generateText(prompt);

    return NextResponse.json({
      success: true,
      answer: response,
      documentsUsed: context.includes('[Document:') ? 'Knowledge base referenced' : 'No documents found'
    });

  } catch (error) {
    console.error('[RAG Query] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
