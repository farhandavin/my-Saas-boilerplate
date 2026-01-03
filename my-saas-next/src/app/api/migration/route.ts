
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationJobs, teams } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { withTeam } from '@/lib/middleware/auth';
import { z } from 'zod';

export const GET = withTeam(async (req, context: any) => {
  const { team } = context;

  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    // Fetch migration jobs
    const jobs = await db
      .select()
      .from(migrationJobs)
      .where(eq(migrationJobs.teamId, team.teamId))
      .orderBy(desc(migrationJobs.createdAt));

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to fetch migrations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = withTeam(async (req, context: any) => {
  const { team } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    // Start a new migration
    const body = await req.json();
    const { targetVersion } = body;

    if (!targetVersion) {
      return NextResponse.json({ error: 'Target version required' }, { status: 400 });
    }

    // 2. Create Job
    const [job] = await db.insert(migrationJobs).values({
      teamId: team.teamId,
      status: 'PENDING',
      // targetVersion, // Column doesn't exist
      logs: [],
      startedAt: new Date(), // Mock start
    }).returning();

    // Update team migration status
    await db.update(teams)
      .set({ migrationStatus: 'IN_PROGRESS' })
      .where(eq(teams.id, team.teamId));

    return NextResponse.json(job);
  } catch (error) {
    console.error('Failed to start migration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
