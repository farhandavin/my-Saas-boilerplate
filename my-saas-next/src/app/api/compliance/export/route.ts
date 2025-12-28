// src/app/api/compliance/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// GET /api/compliance/export - Export user data (GDPR compliant)
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // Collect all user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        teamMembers: {
          include: {
            team: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        auditLogs: {
          select: {
            action: true,
            details: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        notifications: {
          select: {
            title: true,
            message: true,
            type: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!user) return unauthorized('User not found');

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        ...user,
        teams: user.teamMembers.map(tm => ({
          ...tm.team,
          role: tm.role
        }))
      }
    };

    // Return as JSON (or could be formatted as PDF/ZIP)
    return NextResponse.json({
      success: true,
      message: 'Your data export is ready',
      data: exportData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
