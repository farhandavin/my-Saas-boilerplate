
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { OnboardingService } from '@/services/onboardingService';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TeamService } from '@/services/teamService';
import { getErrorMessage } from '@/lib/error-utils';


async function getUserFromToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role, useCase, teamSize, industry, dataRegion } = body;

    // Get user's team
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, user.userId),
      with: { team: true }
    });

    let targetTeamId = membership?.teamId;

    if (!targetTeamId) {
      // Auto-create team if not found (Critical fix for new users)
      const orgName = body.orgName || `Team ${user.email.split('@')[0]}`;

      const newTeam = await TeamService.createTeam({
        name: orgName,
        ownerId: user.userId
      });
      targetTeamId = newTeam.id;
    }

    // Complete onboarding (Pass all data to service)
    const result = await OnboardingService.complete(
      user.userId,
      targetTeamId!,
      { role, useCase, teamSize, industry, dataRegion }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Internal server error' },
      { status: 500 }
    );
  }
}
