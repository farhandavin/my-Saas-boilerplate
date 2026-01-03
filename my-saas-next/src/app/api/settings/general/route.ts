
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser, withTeam } from '@/lib/middleware/auth';
import { z } from 'zod';

// Schema for validation
const settingSchema = z.object({
  name: z.string().min(1),
  supportEmail: z.string().email().optional().or(z.literal('')),
  industry: z.string().optional(),
  dataRegion: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export const GET = withTeam(async (req, context: any) => {
  const { team } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    const [teamData] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, team.teamId))
      .limit(1);

    if (!teamData) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({
      companyName: teamData.name,
      workspaceId: teamData.displayId || teamData.slug, // Fallback to slug if displayId not set
      supportEmail: teamData.supportEmail || '',
      industry: teamData.industry || 'Fintech & Banking',
      dataRegion: teamData.dataRegion || 'id',
      currency: teamData.currency || 'IDR',
      timezone: teamData.timezone || 'asia_jakarta',
      language: teamData.language || 'en',
      logoUrl: teamData.logoUrl,
      ssoEnabled: teamData.ssoEnabled || false,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = withTeam(async (req, context: any) => {
  const { team } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    const body = await req.json();
    const result = settingSchema.safeParse({
      name: body.companyName,
      supportEmail: body.supportEmail,
      industry: body.industry,
      dataRegion: body.dataRegion,
      currency: body.currency,
      timezone: body.timezone,
      language: body.language
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
    }

    const { data } = result;

    // Update team
    await db.update(teams)
      .set({
        name: data.name,
        supportEmail: data.supportEmail,
        industry: data.industry,
        dataRegion: data.dataRegion,
        currency: data.currency,
        timezone: data.timezone,
        language: data.language,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, team.teamId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
