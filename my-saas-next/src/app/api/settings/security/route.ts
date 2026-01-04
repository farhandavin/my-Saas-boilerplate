
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, roles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { withTeam } from '@/lib/middleware/auth';
import { z } from 'zod';
import { withCsrfProtection } from '@/lib/csrf';

// Validation
const securityConfigSchema = z.object({
  ssoEnabled: z.boolean().optional(),
  passwordRotationDays: z.number().min(0).optional(),
  sessionTimeoutMinutes: z.number().min(1).optional(),
  twoFactorRequired: z.boolean().optional(),
});

export const GET = withTeam(async (req, context) => {
  const { team } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    // Fetch Team Settings
    const [teamData] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, team.teamId!))
      .limit(1);

    // Fetch Roles
    const teamRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.teamId, team.teamId!));

    if (!teamData) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({
      config: {
        ssoEnabled: teamData.ssoEnabled || false,
        ssoProvider: teamData.ssoProvider || 'Okta',
        passwordRotationDays: teamData.passwordRotationDays || 90,
        sessionTimeoutMinutes: teamData.sessionTimeoutMinutes || 30,
      },
      roles: teamRoles
    });

  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = withTeam(async (req, context) => {
  // CSRF Protection - prevent cross-site request forgery
  const csrfError = withCsrfProtection(req);
  if (csrfError) return csrfError;

  const { team } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    const body = await req.json();
    const result = securityConfigSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const { data } = result;

    await db.update(teams)
      .set({
        ssoEnabled: data.ssoEnabled,
        passwordRotationDays: data.passwordRotationDays,
        sessionTimeoutMinutes: data.sessionTimeoutMinutes,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, team.teamId!));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
