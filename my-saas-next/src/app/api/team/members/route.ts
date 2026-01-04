
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized, forbidden } from '@/lib/middleware/auth';
import { db } from '@/db';
import { teamMembers, users, auditLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';


// GET /api/team/members - List members of current team
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');
    if (!payload.teamId) return unauthorized('Team context required');

    // Check if user is part of the team
    const member = await db.query.teamMembers.findFirst({
        where: and(
            eq(teamMembers.userId, payload.userId),
            eq(teamMembers.teamId, payload.teamId)
        )
    });

    if (!member) {
      return forbidden('You are not a member of this team');
    }

    // List all members with user details
    const members = await db.query.teamMembers.findMany({
        where: eq(teamMembers.teamId, payload.teamId),
        orderBy: [desc(teamMembers.joinedAt)],
        with: {
            user: true
        }
    });

    const formattedMembers = members.map(m => ({
        id: m.id,
        userId: m.userId,
        name: m.user?.name || 'Unknown',
        email: m.user?.email || 'No Email',
        role: m.role,
        joinedAt: m.joinedAt
    }));

    return NextResponse.json({ success: true, members: formattedMembers });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE /api/team/members - Remove a member
export async function DELETE(req: NextRequest) {
    try {
      const token = extractToken(req);
      if (!token) return unauthorized();
  
      const payload = verifyToken(token);
      if (!payload) return unauthorized('Invalid token');
      if (!payload.teamId) return unauthorized('Team context required');
  
      const { searchParams } = new URL(req.url);
      const userIdToDelete = searchParams.get('userId');
  
      if (!userIdToDelete) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }

      // Check permissions (requester must be ADMIN or MANAGER)
      const requester = await db.query.teamMembers.findFirst({
          where: and(
              eq(teamMembers.userId, payload.userId),
              eq(teamMembers.teamId, payload.teamId)
          )
      });
  
      if (!requester || !requester.role || !['ADMIN', 'MANAGER'].includes(requester.role)) {
        return forbidden('Only admins and managers can remove members');
      }

      // Cannot remove yourself
      if (userIdToDelete === payload.userId) {
          return NextResponse.json({ error: 'You cannot remove yourself. Leave the team instead.' }, { status: 400 });
      }

      // Check target member existence and role
      const targetMember = await db.query.teamMembers.findFirst({
        where: and(
            eq(teamMembers.userId, userIdToDelete),
            eq(teamMembers.teamId, payload.teamId)
        ),
        with: { user: true }
      });

      if (!targetMember) {
          return NextResponse.json({ error: 'Member not found or not in this team' }, { status: 404 });
      }

      // Owners cannot be removed by Admins (only other Owners could, but usually Ownership transfer is separate)
      if (targetMember.role === 'ADMIN' && requester.role !== 'ADMIN') {
          return forbidden('Managers cannot remove Admins');
      }

      // Proceed to remove
      await db.delete(teamMembers).where(
          and(
              eq(teamMembers.userId, userIdToDelete),
              eq(teamMembers.teamId, payload.teamId)
          )
      );
  
      // Audit log
      await db.insert(auditLogs).values({
          teamId: payload.teamId,
          userId: payload.userId,
          action: 'MEMBER_REMOVED',
          entity: 'team',
          details: `Removed member ${targetMember.user?.email || userIdToDelete} from team`
      });
  
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
