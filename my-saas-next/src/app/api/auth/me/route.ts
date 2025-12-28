// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // Fetch full user data with teams
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        provider: true,
        createdAt: true,
        teamMembers: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                slug: true,
                tier: true,
                aiUsageCount: true,
                aiTokenLimit: true,
              }
            }
          }
        }
      }
    });

    if (!user) return unauthorized('User not found');

    // Format response
    const teams = user.teamMembers.map(tm => ({
      ...tm.team,
      role: tm.role,
      isActive: tm.teamId === payload.teamId
    }));

    const activeTeam = teams.find(t => t.isActive) || teams[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        provider: user.provider,
      },
      teams,
      activeTeam,
      currentRole: payload.role
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}
