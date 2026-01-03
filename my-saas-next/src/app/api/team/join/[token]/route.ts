
// src/app/api/team/join/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { TeamService } from '@/services/teamService';
import { db } from '@/db';
import { invitations } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/team/join/[token] - Accept invitation and join team
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> } // Updated for Next.js 15: params is simpler but in 15 it might be async in layout/page, safe to treat as Promise or object depending on next config. Boilerplate is Next 14/15 likely. Kept type safety.
) {
  try {
    const authToken = extractToken(req);
    if (!authToken) return unauthorized();

    const payload = verifyToken(authToken);
    if (!payload) return unauthorized('Invalid token');

    const { token: inviteToken } = await params;

    if (!inviteToken) {
      return NextResponse.json({ error: 'Invitation token is required' }, { status: 400 });
    }

    const result = await TeamService.joinTeam(inviteToken, payload.userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Join team error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// GET /api/team/join/[token] - Get invitation details (for preview)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: inviteToken } = await params;

    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, inviteToken),
      with: {
        team: {
            columns: { name: true, slug: true }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    if (invitation.expires < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      teamName: invitation.team.name,
      role: invitation.role,
      email: invitation.email
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
