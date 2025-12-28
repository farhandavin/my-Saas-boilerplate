// src/lib/middleware/billing.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Check if team has enough AI quota
export const checkAiQuota = async (teamId: string, requiredTokens: number = 10) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { aiUsageCount: true, aiTokenLimit: true }
  });

  if (!team) return { allowed: false, reason: 'Team not found' };

  const remaining = team.aiTokenLimit - team.aiUsageCount;
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
  await prisma.team.update({
    where: { id: teamId },
    data: { aiUsageCount: { increment: tokens } }
  });
};

// Get quota status
export const getQuotaStatus = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { aiUsageCount: true, aiTokenLimit: true, tier: true }
  });

  if (!team) return null;

  return {
    used: team.aiUsageCount,
    limit: team.aiTokenLimit,
    remaining: team.aiTokenLimit - team.aiUsageCount,
    tier: team.tier,
    percentUsed: Math.round((team.aiUsageCount / team.aiTokenLimit) * 100)
  };
};

// Middleware wrapper for AI endpoints
export const withQuotaCheck = (
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  estimatedCost: number = 10
) => {
  return async (req: NextRequest, context: any) => {
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
