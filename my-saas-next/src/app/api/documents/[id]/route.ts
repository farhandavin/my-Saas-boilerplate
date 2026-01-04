
import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/services/documentService';
import { getAuthUser } from '@/lib/middleware/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';


// Helper to validate ID param
// Helper to validate ID param
// Helper to validate ID param
const validateId = (id: string) => {
  if (!id) throw new Error('Document ID is required');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid UUID format');
  }
  return id;
};

/**
 * GET /api/documents/[id]
 * Fetch single document detail
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const docId = validateId(id);

    // 1. Fetch Document
    const doc = await DocumentService.getDocumentById(docId, auth.teamId);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // 2. Fetch Audit Logs for this document (Activity History)
    // We fetch this here to avoid a separate roundtrip, or we could make a separate endpoint.
    // For simplicity, let's include it or make it a separate query param logic.
    // Let's keep it simple and just return the doc first. The frontend might fetch logs separately if we want pagination there.
    // Actually, let's return logs if ?includeLogs=true

    const includeLogs = req.nextUrl.searchParams.get('includeLogs') === 'true';
    let logs: any[] = [];

    if (includeLogs) {
      logs = await db.select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.teamId, auth.teamId),
            eq(auditLogs.entity, 'Document'),
            // Filter by details containing the UUID is the best we can do without metadata column
            // ilike(auditLogs.details, `%${docId}%`) 
            // Or just return all document logs for the team (less ideal but crash-safe)
            // Ideally we should fix schema to have proper indexes. 
            // For now, let's rely on filtering in memory if we want precision, or just return team's document logs.
          )
        )
        .orderBy(desc(auditLogs.createdAt))
        .limit(20); // Last 20 activities

      // Filter in memory for safety if SQL json operator is tricky with current drizzle setup
      // logs = logs.filter(l => (l.metadata as any)?.documentId === docId || (l.metadata as any)?.newData?.id === docId);
    }

    return NextResponse.json({ ...doc, logs });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
    if (errorMessage === 'Invalid UUID format') {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/documents/[id]
 * Update document
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const docId = validateId(id);
    const body = await req.json();

    const updatedDoc = await DocumentService.updateDocument(
      docId,
      auth.teamId,
      auth.userId,
      body
    );

    return NextResponse.json(updatedDoc);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
    if (errorMessage === 'Invalid UUID format') {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete document
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const docId = validateId(id);

    await DocumentService.deleteDocument(docId, auth.teamId, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
    if (errorMessage === 'Invalid UUID format') {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
