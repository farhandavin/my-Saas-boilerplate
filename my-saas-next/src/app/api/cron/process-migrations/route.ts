
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { migrationJobs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest-client';

export const dynamic = 'force-dynamic';

/**
 * CRON Job: Process Pending Migrations
 * Retries stuck "PENDING" jobs by dispatching Inngest events
 */
export async function GET(request: Request) {
  try {
    // 1. Authorization
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Find PENDING jobs
    const pendingJobs = await db.query.migrationJobs.findMany({
      where: eq(migrationJobs.status, 'PENDING'),
      limit: 5, // Process batch of 5
      with: { team: true }
    });

    if (pendingJobs.length === 0) {
      return NextResponse.json({ message: 'No pending migrations' });
    }

    // 3. Dispatch Events
    const events = pendingJobs.map(job => {
        const targetUrl = job.team?.dedicatedDatabaseUrl;
        if (!targetUrl) return null;
        return {
            name: "tenant/migrate",
            data: {
                teamId: job.teamId,
                targetDbUrl: targetUrl,
                jobId: job.id
            }
        };
    }).filter(Boolean) as any[];

    if (events.length > 0) {
        await inngest.send(events);
    }
    
    return NextResponse.json({ 
      success: true, 
      count: events.length,
      message: `Triggered ${events.length} pending migrations`
    });

  } catch (error) {
    console.error('[CRON] Migration Trigger Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
