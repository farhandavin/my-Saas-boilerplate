// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - Get user's notifications
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const notifications = await prisma.notification.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        team: { select: { name: true, slug: true } }
      }
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: payload.userId, isRead: false }
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
