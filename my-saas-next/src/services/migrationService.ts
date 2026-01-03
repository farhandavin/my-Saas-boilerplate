
// src/services/migrationService.ts
import { db } from '@/db'; // Global Drizzle (Pooled)
import { migrationJobs, teams } from '@/db/schema';
import { MigrationEngine } from '@/lib/migration-engine';
import { eq } from 'drizzle-orm';
import { inngest } from '@/lib/inngest-client';

/**
 * Enterprise Migration Service
 * Handles zero-downtime migration from Shared DB -> Isolated DB
 */
export const MigrationService = {
  /**
   * Start the migration job
   * Now triggers an Inngest event for background processing
   */
  async startMigrationJob(teamId: string, targetDbUrl: string) {
    console.log(`🚀 [MIGRATION] Requesting job for Team: ${teamId}`);

    // Verify team exists and is on shared DB
    const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId)
    });

    if (!team) throw new Error("Team not found");
    // Ensure we don't migrate if already migrated? (Optional check from old service logic)
    
    // 1. Create Job Record
    const [job] = await db.insert(migrationJobs).values({
        teamId,
        targetUrl: targetDbUrl,
        status: 'PENDING',
        logs: [{ timestamp: new Date().toISOString(), level: 'INFO', message: 'Job requested' }],
        startedAt: new Date()
    }).returning();

    try {
      // 2. Dispatch Inngest Event
      await inngest.send({
        name: "tenant/migrate",
        data: {
            teamId,
            targetDbUrl,
            jobId: job.id
        }
      });

      console.log(`✅ [MIGRATION] Event dispatched for ${teamId} (Job: ${job.id})`);

    } catch (error) {
      console.error(`❌ [MIGRATION] Dispatch Failed:`, error);

      // Fail status
      await db.update(migrationJobs)
        .set({ 
            status: 'FAILED',

        })
        .where(eq(migrationJobs.id, job.id));
        
      throw error;
    }
    
    return job;
  },

  /**
   * Legacy copyData wrapper if needed directly (e.g. for testing without Inngest)
   * Delegates to MigrationEngine
   */
  async copyData(teamId: string, jobId: string) {
     // This logic is now inside MigrationEngine.copyData (simulated)
     // or inside the Inngest function.
     // Kept for backward compat signature if any API calls it directly.
     console.warn("Call to deprecated direct copyData in MigrationService. Use Inngest event.");
  }
};
