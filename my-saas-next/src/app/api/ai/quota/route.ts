
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { db } from '@/db';
import { teams } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
     // Standardized Auth Middleware
    const token = extractToken(req);
    if (!token) return unauthorized();

    const user = verifyToken(token);
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    // Security check: User must belong to this team (implied or explicit?)
    // Basic verifyToken usually gives { userId, teamId }.
    // If param teamId != token teamId, might be unauthorized unless owner/admin.
    // For now, implementing basic check:
    if (user.teamId !== teamId) {
         // Optionally fetch membership to check if multiple teams supported
         // But sticking to basic token payload match for safety
         // or just proceed if token is valid and let frontend handle it?
         // Safer to block mismatch.
         return NextResponse.json({ error: 'Unauthorized for this team' }, { status: 403 });
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      columns: {
        tier: true,
        aiUsageCount: true,
        aiTokenLimit: true,
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Calculate reset date (first of next month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return NextResponse.json({
      success: true,
      data: {
        used: team.aiUsageCount || 0,
        limit: team.aiTokenLimit || 500,
        tier: team.tier || 'FREE',
        resetDate: resetDate.toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Quota fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
