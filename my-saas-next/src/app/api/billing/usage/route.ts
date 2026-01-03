
import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { db } from '@/db';
import { teams, auditLogs } from '@/db/schema';
import { eq, and, sql, gte, like } from 'drizzle-orm';

// GET /api/billing/usage - Get team's AI usage statistics
export const GET = withTeam(async (req, context: any) => {
  const { team, user } = context;
  if (!team) {
    return NextResponse.json({ error: 'Team context required' }, { status: 403 });
  }

  const teamData = await db.query.teams.findFirst({
    where: eq(teams.id, team.teamId),
    columns: {
      aiUsageCount: true,
      aiTokenLimit: true,
      tier: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
      createdAt: true
    }
  });

  if (!teamData) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  // Calculate usage percentage
  const limit = teamData.aiTokenLimit ?? 0;
  const usage = teamData.aiUsageCount ?? 0;

  const usagePercent = limit > 0
    ? Math.round((usage / limit) * 100)
    : 0;

  // Get recent AI usage logs (last 30 days simulation)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Drizzle Aggregation
  // Assuming grouped by DATE(createdAt)
  const usageByDay = await db
    .select({
      date: sql<string>`DATE(${auditLogs.createdAt})`,
      count: sql<number>`count(${auditLogs.id})`
    })
    .from(auditLogs)
    .where(and(
      eq(auditLogs.teamId, team.teamId),
      like(auditLogs.action, '%AI%'), // contains 'AI'
      gte(auditLogs.createdAt, thirtyDaysAgo)
    ))
    .groupBy(sql`DATE(${auditLogs.createdAt})`);

  return NextResponse.json({
    success: true,
    data: {
      currentUsage: teamData.aiUsageCount,
      limit: teamData.aiTokenLimit,
      usagePercent,
      tier: teamData.tier,
      hasSubscription: !!teamData.stripeSubscriptionId,
      memberSince: teamData.createdAt,
      usageHistory: usageByDay.slice(-7).map(d => ({
        date: d.date,
        count: Number(d.count)
      }))
    }
  });
}, { roles: ['ADMIN', 'MANAGER'] });
