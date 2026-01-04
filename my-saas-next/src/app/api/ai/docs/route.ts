
// src/app/api/ai/docs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { db } from '@/db';
import { documents, auditLogs } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';


// GET /api/ai/docs - List knowledge base documents
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const docs = await db.query.documents.findMany({
      where: eq(documents.teamId, payload.teamId),
      orderBy: [desc(documents.createdAt)],
      columns: {
        id: true,
        title: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      documents: docs
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
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

    const doc = await db.query.documents.findFirst({
        where: and(
            eq(documents.id, docId),
            eq(documents.teamId, payload.teamId)
        )
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await db.delete(documents).where(eq(documents.id, docId));

    await db.insert(auditLogs).values({
        teamId: payload.teamId!,
        userId: payload.userId,
        action: 'DOCUMENT_DELETED',
        entity: 'Document',
        details: `Deleted document ID: ${docId}`
    });

    return NextResponse.json({ success: true, message: 'Document deleted' });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
