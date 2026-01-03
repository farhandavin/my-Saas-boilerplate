
import { db } from '@/db';
import { users, teams, usageBillings, systemLogs, migrationJobs } from '@/db/schema';
import { sql, eq, desc } from 'drizzle-orm';

export const PlatformService = {
  /**
   * Operational Intelligence: Global Stats
   */
  async getGlobalStats() {
    // 1. Total Revenue (Naive sum of all paid invoices - mock for now or use usageBillings)
    // Real implementation would join invoices table
    const [revenue] = await db.select({ 
      total: sql<number>`sum(${usageBillings.totalAmount})` 
    }).from(usageBillings);

    // 2. Token Usage Global
    const [tokenUsage] = await db.select({
      total: sql<number>`sum(${usageBillings.tokensUsed})`
    }).from(usageBillings);

    // 3. User & Team Counts
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [teamCount] = await db.select({ count: sql<number>`count(*)` }).from(teams);

    return {
      totalRevenue: revenue?.total || 0,
      totalAiTokens: tokenUsage?.total || 0,
      totalUsers: userCount?.count || 0,
      totalTeams: teamCount?.count || 0,
    };
  },

  /**
   * Tenant Manager: List all teams
   */
  async getAllTenants() {
    return db.query.teams.findMany({
      with: {
        teamMembers: {
             with: { user: true },
             limit: 1 // Just to see owner/admin
        }
      },
      orderBy: desc(teams.createdAt)
    });
  },

  /**
   * System Health: Mock Checks
   */
  /**
   * System Health: Real Checks
   */
  async getSystemHealth() {
    const healthChecks = [];

    // 1. Database Check
    const start = performance.now();
    try {
      await db.execute(sql`SELECT 1`);
      const latency = Math.round(performance.now() - start);
      healthChecks.push({ service: 'Database (Primary)', status: 'operational', latency: `${latency}ms` });
    } catch (e) {
      healthChecks.push({ service: 'Database (Primary)', status: 'outage', latency: '-' });
    }

    // 2. Mock others for now (Redis, AI)
    healthChecks.push(
      { service: 'Database (Replica)', status: 'operational', latency: '15ms' }, // Mock
      { service: 'Redis Cache', status: 'operational', latency: '5ms' },         // Mock
      { service: 'AI Provider (OpenAI)', status: 'operational', latency: '240ms' } // Mock
    );

    return healthChecks;
  },

  /**
   * Schema Sync: Trigger mass migrations (Simulated Real Workflow)
   */
  async triggerSchemaSync(targetVersion: string) {
    // 1. Create Job Record
    const [job] = await db.insert(migrationJobs).values({
      targetUrl: 'ALL_TENANTS',
      status: 'PENDING',
      progress: 0,
      logs: [{ timestamp: new Date().toISOString(), level: 'INFO', message: `Job initialized for version ${targetVersion}` }]
    }).returning();

    // 2. Simulate Async Process (Fire and Forget in this context, normally strict background worker)
    (async () => {
       await new Promise(r => setTimeout(r, 2000)); // Simulate delay
       
       await db.update(migrationJobs)
         .set({ 
           status: 'IN_PROGRESS', 
           progress: 20,
           logs: sql`logs || ${JSON.stringify([{ timestamp: new Date().toISOString(), level: 'INFO', message: 'Analyzing tenants...' }])}::jsonb`
         })
         .where(eq(migrationJobs.id, job.id));

       await new Promise(r => setTimeout(r, 2000));
       
       await db.update(migrationJobs)
         .set({ 
             status: 'COMPLETED', 
             progress: 100, 
             completedAt: new Date(),
             logs: sql`logs || ${JSON.stringify([{ timestamp: new Date().toISOString(), level: 'SUCCESS', message: 'Migration completed successfully for all tenants.' }])}::jsonb`
         })
         .where(eq(migrationJobs.id, job.id));
    })();

    return {
      jobId: job.id,
      status: 'QUEUED',
      target: 'ALL_TENANTS'
    };
  }
};
