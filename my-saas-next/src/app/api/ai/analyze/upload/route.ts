
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { AiService } from '@/services/aiService';

// Helper: Extract Text from File
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('utf-8'); // For PDF we need 'pdf-parse', for now assume text-based
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const token = extractToken(req);
    if (!token) return unauthorized();
    
    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // 3. Process Text & Embedding
    const content = await extractText(file);
    
    // Using AiService.embed (was generateEmbedding)
    const embedding = await AiService.generateEmbedding(content);

    // 4. Save to DB using Drizzle
    await db.insert(documents).values({
        teamId: payload.teamId!, // Ensure teamId exists in payload
        title,
        content
    });

    return NextResponse.json({ success: true, message: "Document embedded successfully" });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}