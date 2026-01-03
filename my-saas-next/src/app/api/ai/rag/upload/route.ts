// src/app/api/ai/rag/upload/route.ts
// API endpoint for uploading documents to RAG knowledge base

import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/services/ragService';
import { getAuthUser } from '@/lib/middleware/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await req.json();

    // RBAC: Only Admin/Manager can upload
    // Find current team membership from auth.user
    const member = auth.user.teamMembers.find((tm: any) => tm.teamId === auth.teamId);
    if (!member || !member.role || !['ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Only Admins and Managers can upload documents' }, { status: 403 });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await RAGService.uploadDocument(
auth.teamId,
      title,
      content
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to upload document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded and embedded successfully'
    });

  } catch (error) {
    console.error('[RAG Upload] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
