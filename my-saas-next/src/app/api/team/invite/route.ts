
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized, forbidden } from '@/lib/middleware/auth';
import { TeamService } from '@/services/teamService';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

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

    // Check if user has permission to invite (ADMIN or MANAGER)
    const member = await db.query.teamMembers.findFirst({
        where: and(
            eq(teamMembers.userId, payload.userId),
            eq(teamMembers.teamId, teamId)
        )
    });

    if (!member || !member.role || !['ADMIN', 'MANAGER'].includes(member.role)) {
      return forbidden('Only admins and managers can invite members');
    }

    const result = await TeamService.inviteMember({
      teamId,
      email,
      role: role || 'STAFF',
      inviterId: payload.userId
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
