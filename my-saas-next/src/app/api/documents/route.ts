
import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/services/documentService';
import { getAuthUser } from '@/lib/middleware/auth';

/**
 * GET /api/documents
 * List documents with pagination and search
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const search = searchParams.get('search') || undefined;

    const result = await DocumentService.getDocuments(auth.teamId, page, pageSize, search);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Create a new document manually (for Knowledge Base)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // RBAC: Only Admin/Manager can upload
    const member = auth.user.teamMembers.find((tm: any) => tm.teamId === auth.teamId);
    if (!member || !member.role || !['ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Only Admins and Managers can upload documents' }, { status: 403 });
    }

    const newDoc = await DocumentService.createDocument(
      auth.teamId,
      auth.userId,
      title,
      content
    );

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
