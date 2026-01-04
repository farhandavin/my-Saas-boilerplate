
// src/app/api/ai/chat-docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { checkAiQuota, deductTokens } from '@/lib/middleware/billing';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { AiService } from '@/services/aiService';
import { RAGService } from '@/services/ragService';
import { getErrorMessage } from '@/lib/error-utils';


// POST /api/ai/chat-docs - Chat with documents (RAG)
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Check quota
    const estimatedCost = 20;
    const quotaCheck = await checkAiQuota(payload.teamId, estimatedCost);
    if (!quotaCheck.allowed) {
      return NextResponse.json({ 
        error: 'AI quota exceeded',
        details: quotaCheck 
      }, { status: 402 });
    }

    // Get context from Internal Knowledge Base (Vector Search)
    const context = await RAGService.getContext(payload.teamId, question);

    if (!context || context.includes('No relevant internal documents')) {
       // Optional: Fallback or inform user
       // We can still proceed if the LLM has general knowledge, but for RAG specific, maybe warn
    }

    // Mask PII and generate response
    const safeQuestion = AiService.maskPII(question);
    const prompt = `Based on the following company documents:\n\n${context}\n\nAnswer this question: ${safeQuestion}`;
    
    // Use generateText
    const response = await AiService.generateText(prompt);

    // Deduct tokens
    await deductTokens(payload.teamId, estimatedCost);

    // Audit log
    await db.insert(auditLogs).values({
        teamId: payload.teamId!,
        userId: payload.userId,
        action: 'AI_CHAT_DOCS',
        entity: 'Document',
        details: `Asked: ${question.substring(0, 100)}...`
    });

    return NextResponse.json({
      success: true,
      answer: response,
      tokensUsed: estimatedCost
    });
  } catch (error: unknown) {
    console.error('Chat docs error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
