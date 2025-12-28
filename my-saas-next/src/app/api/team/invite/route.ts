// src/app/api/team/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized, forbidden } from '@/lib/middleware/auth';
import { TeamService } from '@/services/teamService';
import { prisma } from '@/lib/prisma';

// POST /api/team/invite - Send team invitation
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { teamId, email, role } = await req.json();

    if (!teamId || !email) {
      return NextResponse.json({ 
        error: 'Team ID and email are required' 
      }, { status: 400 });
    }

    // Check if user has permission to invite (OWNER or ADMIN)
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: payload.userId, teamId } }
    });

    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      return forbidden('Only owners and admins can invite members');
    }

    const result = await TeamService.inviteMember({
      teamId,
      email,
      role: role || 'MEMBER',
      inviterId: payload.userId
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
