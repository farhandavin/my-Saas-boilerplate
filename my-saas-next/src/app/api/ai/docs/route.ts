// src/app/api/ai/docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// GET /api/ai/docs - List knowledge base documents
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const documents = await prisma.document.findMany({
      where: { teamId: payload.teamId },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      documents
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/ai/docs - Delete a document
export async function DELETE(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('id');

    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: { id: docId, teamId: payload.teamId }
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await prisma.document.delete({ where: { id: docId } });

    await prisma.auditLog.create({
      data: {
        teamId: payload.teamId,
        userId: payload.userId,
        action: 'DOCUMENT_DELETED',
        details: `Deleted document: ${doc.title}`
      }
    });

    return NextResponse.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
