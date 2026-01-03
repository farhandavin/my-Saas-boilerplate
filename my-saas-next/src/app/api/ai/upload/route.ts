
// src/app/api/ai/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { db } from '@/db';
import { documents, auditLogs, teamMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { AiService } from '@/services/aiService';

// POST /api/ai/upload - Upload document for RAG
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // Check role from DB to be safe
    const member = await db.query.teamMembers.findFirst({
        where: and(eq(teamMembers.userId, payload.userId), eq(teamMembers.teamId, payload.teamId!))
    });

    if (!member || !['ADMIN', 'MANAGER'].includes(member.role!)) {
        return NextResponse.json({ error: 'Only Admins and Managers can upload documents' }, { status: 403 });
    }

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

    // Save document
    const [document] = await db.insert(documents).values({
        teamId: payload.teamId!,
        title,
        content
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
        teamId: payload.teamId!,
        userId: payload.userId,
        action: 'DOCUMENT_UPLOADED',
        entity: 'Document',
        details: `Uploaded ${title}`
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
