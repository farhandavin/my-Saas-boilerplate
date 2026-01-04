
// src/lib/middleware/billing.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// Check if team has enough AI quota
export const checkAiQuota = async (teamId: string, requiredTokens: number = 10) => {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { aiUsageCount: true, aiTokenLimit: true }
  });

  if (!team) return { allowed: false, reason: 'Team not found' };

  // Handle nulls if necessary
  const limit = team.aiTokenLimit || 0;
  const usage = team.aiUsageCount || 0;

  const remaining = limit - usage;
  if (remaining < requiredTokens) {
    return {
      allowed: false,
      reason: 'Quota exceeded',
      remaining,
      required: requiredTokens
    };
  }

  return { allowed: true, remaining };
};

// Deduct tokens after successful AI operation
export const deductTokens = async (teamId: string, tokens: number) => {
  await db.update(teams)
    .set({ aiUsageCount: sql`${teams.aiUsageCount} + ${tokens}` })
    .where(eq(teams.id, teamId));
};

// Get quota status
export const getQuotaStatus = async (teamId: string) => {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: { aiUsageCount: true, aiTokenLimit: true, tier: true }
  });

  if (!team) return null;

  const limit = team.aiTokenLimit || 0;
  const usage = team.aiUsageCount || 0;

  return {
    used: usage,
    limit: limit,
    remaining: limit - usage,
    tier: team.tier,
    percentUsed: limit > 0 ? Math.round((usage / limit) * 100) : 0
  };
};

import { RouteContext } from '@/types/route-context';

// Middleware wrapper for AI endpoints
export const withQuotaCheck = (
  handler: (req: NextRequest, context: RouteContext) => Promise<NextResponse>,
  estimatedCost: number = 10
) => {
  return async (req: NextRequest, context: any) => { // Next.js passes generic context here
    const teamId = context.user?.teamId;
    if (!teamId) {
      return NextResponse.json({ error: 'Team context required' }, { status: 400 });
    }

    const quotaCheck = await checkAiQuota(teamId, estimatedCost);
    if (!quotaCheck.allowed) {
      return NextResponse.json({
        error: 'AI quota exceeded',
        details: quotaCheck
      }, { status: 402 });
    }

    return handler(req, { ...context, quota: quotaCheck });
  };
};
