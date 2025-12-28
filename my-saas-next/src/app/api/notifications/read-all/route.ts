// src/app/api/notifications/read-all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/read-all - Mark all notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    await prisma.notification.updateMany({
      where: { 
        userId: payload.userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
