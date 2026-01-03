import { db } from '@/db';
import { invoices, usageBillings, auditLogs, teamMembers, users } from '@/db/schema';
import { eq, and, gte, sum, desc, count, sql } from 'drizzle-orm';
import { dbCache } from '@/lib/db/cache';

export const DashboardService = {

  /**
   * Get main metric cards data (System Health & General Stats)
   */
  async getMetricStats(teamId: string) {
    return await dbCache(async () => {
      const today = new Date();
      const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // 1. Total Revenue (Lifetime or Year To Date - Let's do YTD)
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const [revenueRes] = await db.select({ total: sum(invoices.amount) })
        .from(invoices)
        .where(and(
          eq(invoices.teamId, teamId),
          eq(invoices.status, 'paid'),
          gte(invoices.paidAt, startOfYear)
        ));

      // 2. AI Token Usage (Cost this month) - Proxy for "Database Load" visual
      const [aiCostRes] = await db.select({ total: sum(usageBillings.usageAmount) })
        .from(usageBillings)
        .where(and(
          eq(usageBillings.teamId, teamId),
          gte(usageBillings.periodStart, currentMonthStart)
        ));

      // 3. Error Rate
      const [totalLogsRes] = await db.select({ count: count() })
        .from(auditLogs)
        .where(eq(auditLogs.teamId, teamId));

      const errorRate = 0;

      return {
        totalRevenue: Number(revenueRes?.total) || 0,
        aiTokenCost: Number(aiCostRes?.total) || 0,
      };
    }, { keys: ['dashboard-metrics', teamId], tags: ['dashboard', `dashboard:${teamId}`] })();
  },

  /**
   * Get Revenue Trend (Last 6 Months)
   */
  async getRevenueTrend(teamId: string) {
    return await dbCache(async () => {
      const today = new Date();
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

      let rows: any[] = [];
      try {
        const result = await db.execute(sql`
          SELECT 
            to_char(paid_at, 'Mon') as month,
            SUM(amount) as total
          FROM ${invoices}
          WHERE team_id = ${teamId} 
            AND status = 'paid'
            AND paid_at >= ${sixMonthsAgo.toISOString()}
            AND paid_at IS NOT NULL
          GROUP BY to_char(paid_at, 'Mon'), date_trunc('month', paid_at)
          ORDER BY date_trunc('month', paid_at) ASC
        `);
        rows = Array.isArray(result) ? result : (result as any).rows || [];
      } catch (e) {
        console.error('Revenue trend query failed:', e);
        rows = [];
      }

      const months: string[] = [];
      const _d = new Date(sixMonthsAgo);
      while (_d <= today) {
        months.push(_d.toLocaleString('default', { month: 'short' }));
        _d.setMonth(_d.getMonth() + 1);
      }

      const dataMap = new Map(rows.map((row: any) => [row.month, Number(row.total) || 0]));

      const chartData = months.map(m => ({
        month: m,
        revenue: (dataMap.get(m) || 0) / 100
      }));

      return chartData;
    }, { keys: ['dashboard-revenue', teamId], tags: ['dashboard', `dashboard:${teamId}`] })();
  },

  /**
   * Get Recent Activity (Audit Logs)
   */
  async getRecentActivity(teamId: string, limit = 5) {
    return await dbCache(async () => {
      const activity = await db.select({
        id: auditLogs.id,
        action: auditLogs.action,
        entity: auditLogs.entity,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        user: {
          name: users.name,
          email: users.email
        }
      })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(eq(auditLogs.teamId, teamId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);

      return activity;
    }, { keys: ['dashboard-activity', teamId, String(limit)], tags: ['dashboard', `dashboard:${teamId}`] })();
  }
};
