// src/app/api/migration/[id]/route.ts
// PATCH endpoint to update migration job status

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationJobs, teams } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { withTeam } from '@/lib/middleware/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withTeam(async (req, context: any) => {
  const { team } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await req.json();

    // Verify job belongs to team
    const [existingJob] = await db
      .select()
      .from(migrationJobs)
      .where(and(
        eq(migrationJobs.id, id),
        eq(migrationJobs.teamId, team.teamId)
      ))
      .limit(1);

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Update job
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }

    if (body.progress !== undefined) {
      updateData.progress = body.progress;
    }

    if (body.logs) {
      // Append new logs
      updateData.logs = [...(existingJob.logs || []), ...body.logs];
    }

    if (body.errorMessage) {
      updateData.errorMessage = body.errorMessage;
      updateData.status = 'FAILED';
    }

    const [updatedJob] = await db
      .update(migrationJobs)
      .set(updateData)
      .where(eq(migrationJobs.id, id))
      .returning();

    // Update team migration status if completed
    if (body.status === 'COMPLETED') {
      await db.update(teams)
        .set({ migrationStatus: 'COMPLETED' })
        .where(eq(teams.id, team.teamId));
    }

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Failed to update migration job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const GET = withTeam(async (req, context: any) => {
  const { team } = context;
  if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });

  const id = req.nextUrl.pathname.split('/').pop();

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const [job] = await db.select().from(migrationJobs)
    .where(and(eq(migrationJobs.id, id), eq(migrationJobs.teamId, team.teamId)))
    .limit(1);

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  return NextResponse.json(job);
});

export const DELETE = withTeam(async (req, context: any) => {
  const { team } = context;
  if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });

  const id = req.nextUrl.pathname.split('/').pop();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  // Verify ownership
  const [job] = await db.select().from(migrationJobs)
    .where(and(eq(migrationJobs.id, id), eq(migrationJobs.teamId, team.teamId)))
    .limit(1);

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  // Check if running
  if (job.status === 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Cannot delete running job' }, { status: 400 });
  }

  await db.delete(migrationJobs).where(eq(migrationJobs.id, id));

  return NextResponse.json({ success: true });
});
