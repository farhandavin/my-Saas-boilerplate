// src/services/billingService.ts
import { prisma } from '@/lib/prisma';

export const BillingService = {
  async deductToken(teamId: string, amount: number) {
    return await prisma.team.update({
      where: { id: teamId },
      data: {
        aiUsageCount: { increment: amount }
      }
    });
  },

  async checkQuota(teamId: string, cost: number): Promise<boolean> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { aiUsageCount: true, aiTokenLimit: true, tier: true }
    });

    if (!team) return false;
    if (team.tier === 'ENTERPRISE') return true; // Unlimited

    return (team.aiTokenLimit - team.aiUsageCount) >= cost;
  }
};