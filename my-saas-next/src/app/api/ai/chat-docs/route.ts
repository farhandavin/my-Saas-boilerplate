// src/app/api/ai/chat-docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { checkAiQuota, deductTokens } from '@/lib/middleware/billing';
import { prisma } from '@/lib/prisma';
import { AiService } from '@/services/aiService';

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

    // Get team documents for context
    const documents = await prisma.document.findMany({
      where: { teamId: payload.teamId },
      select: { title: true, content: true },
      take: 5
    });

    if (documents.length === 0) {
      return NextResponse.json({ 
        error: 'No documents in knowledge base. Please upload documents first.' 
      }, { status: 400 });
    }

    // Build context from documents
    const context = documents
      .map(d => `[${d.title}]\n${d.content}`)
      .join('\n\n---\n\n');

    // Mask PII and generate response
    const safeQuestion = AiService.maskPII(question);
    const prompt = `Based on the following company documents:\n\n${context}\n\nAnswer this question: ${safeQuestion}`;
    
    const response = await AiService.generateText(prompt);

    // Deduct tokens
    await deductTokens(payload.teamId, estimatedCost);

    // Audit log
    await prisma.auditLog.create({
      data: {
        teamId: payload.teamId,
        userId: payload.userId,
        action: 'AI_CHAT_DOCS',
        details: `Asked: ${question.substring(0, 100)}...`
      }
    });

    return NextResponse.json({
      success: true,
      answer: response,
      tokensUsed: estimatedCost
    });
  } catch (error: any) {
    console.error('Chat docs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
