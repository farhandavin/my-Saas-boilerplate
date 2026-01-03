// src/app/api/ai/rag/documents/route.ts
// API endpoint for listing and managing RAG documents

import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/services/ragService';
import { getAuthUser } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await RAGService.listDocuments(auth.teamId);

    return NextResponse.json({
      success: true,
      documents
    });

  } catch (error) {
    console.error('[RAG Documents] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const result = await RAGService.deleteDocument(documentId, auth.teamId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete document' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('[RAG Delete] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
