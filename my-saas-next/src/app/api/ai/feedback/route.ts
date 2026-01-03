import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { aiFeedback } from '@/db/schema';
import { ratelimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest, context: any) {
  // 1. Rate Check
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  try {
    const body = await req.json();
    const { teamId, userId, messageId, rating, comment } = body;

    if (!teamId || !messageId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Save to DB
    await db.insert(aiFeedback).values({
      teamId,
      userId,
      messageId,
      rating, // 1 or -1
      comment
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
