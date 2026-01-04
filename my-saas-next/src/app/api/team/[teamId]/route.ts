import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { TeamService } from '@/services/teamService';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';



export async function GET(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { teamId } = await params;

    // Verify membership
    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.userId, payload.userId), eq(teamMembers.teamId, teamId)),
      with: { user: true }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Team not found or access denied' }, { status: 404 });
    }

    // Fetch full team details
    const team = await TeamService.getTeamDetails(teamId);

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      team: {
        ...team,
        myRole: membership.role // Attach the role so the frontend can check permissions
      }
    });

  } catch (error: unknown) {
    console.error('Get team details error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { teamId } = await params;

    // Authorization: User must be "OWNER" (or ADMIN for simplicity, but usually OWNER) of the team
    // Check membership and role
    const membership = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.userId, payload.userId), eq(teamMembers.teamId, teamId))
    });

    if (!membership || !membership.role || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { name, branding, smtpSettings } = await req.json();

    // Validate minimally if needed, but schema handles type safety mostly.

    const updatedTeam = await TeamService.updateTeam(teamId, {
      name,
      branding,
      smtpSettings
    });

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (error: unknown) {
    console.error('Update team error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
