import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { DemoService } from '@/services/DemoService'; // Make sure to export this

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();
    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const data = await DemoService.getAll(payload.teamId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();
    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const body = await req.json();
    const newItem = await DemoService.create(body, payload.userId);
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}