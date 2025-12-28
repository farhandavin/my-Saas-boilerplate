import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AiService } from '@/services/aiService'; // Pastikan service ini ada
import { UserJwtPayload } from '@/types';

// Helper: Extract Text from File (Sederhana untuk txt/md, perlu pdf-parse untuk PDF)
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('utf-8'); // Untuk PDF butuh library 'pdf-parse'
}

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const token = (await headers()).get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // 3. Process Text & Embedding
    const content = await extractText(file);
    // Asumsi: AiService punya method generateEmbedding. 
    // Jika belum, tambahkan method ini di services/aiService.ts menggunakan model 'text-embedding-004'
    const embedding = await AiService.generateEmbedding(content); 

    // 4. Save to DB (Raw SQL for Vector)
    // Prisma belum support vector native create, pakai executeRaw
    const docId = `doc_${Date.now()}`;
    await prisma.$executeRaw`
      INSERT INTO "Document" ("id", "teamId", "title", "content", "embedding", "createdAt")
      VALUES (${docId}, ${user.teamId}, ${title}, ${content}, ${embedding}::vector, NOW())
    `;

    return NextResponse.json({ success: true, message: "Document embedded successfully" });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}