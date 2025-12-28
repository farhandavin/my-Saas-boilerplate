// src/app/api/ai/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// POST /api/ai/upload - Upload document for RAG
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;

    if (!file || !title) {
      return NextResponse.json({ 
        error: 'File and title are required' 
      }, { status: 400 });
    }

    // Read file content
    const content = await file.text();

    if (!content.trim()) {
      return NextResponse.json({ 
        error: 'File is empty' 
      }, { status: 400 });
    }

    // TODO: Generate embedding using AI service
    // const embedding = await AiService.generateEmbedding(content);

    // Save document
    const document = await prisma.document.create({
      data: {
        teamId: payload.teamId,
        title,
        content,
        // embedding: will be added when embedding service is integrated
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        teamId: payload.teamId,
        userId: payload.userId,
        action: 'DOCUMENT_UPLOADED',
        details: `Uploaded document: ${title} (${file.name})`
      }
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        createdAt: document.createdAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
