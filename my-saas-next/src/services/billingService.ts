
// src/services/usageBillingService.ts
// Unified Billing Service (Pilar 3: Payment & Monetization)
// Handles Subscriptions, Usage-Based Billing, and Stripe Webhooks

import { db } from '@/db';
import { getTenantDb } from '@/lib/db-router';
import { teams, usageBillings } from '@/db/schema';
import { NotificationService } from './notificationService';
import { eq, and, sql } from 'drizzle-orm';

// Pricing configuration
const PRICING = {
  FREE: {
    baseAmount: 0,
    tokenLimit: 500,
    overageRate: 0 // No overage for free tier
  },
  PRO: {
    baseAmount: 299000,
    tokenLimit: 50000,
    overageRate: 10
  },
  ENTERPRISE: {
    baseAmount: 999000,
    tokenLimit: 500000,
    overageRate: 10
  }
};

export const BillingService = {

  // ============================================================================
  // 1. ACCESS CONTROL & QUOTA (Logic)
  // ============================================================================

  /**
   * DEPRECATED: Use checkAndDeductQuota for atomic operations
   * Kept for backwards compatibility but logs warning
   */
  async checkQuota(teamId: string, cost: number): Promise<boolean> {
    console.warn('[BillingService] checkQuota is deprecated - use checkAndDeductQuota for atomic operations');
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      columns: { aiUsageCount: true, aiTokenLimit: true, tier: true, subscriptionStatus: true }
    });

    if (!team) return false;

    // Graceful Degradation: Disable AI if billing is past_due
    if (team.subscriptionStatus === 'past_due' || team.subscriptionStatus === 'canceled' || team.subscriptionStatus === 'unpaid') {
      console.warn(`AI Access Blocked for team ${teamId}: Payment ${team.subscriptionStatus}`);
      return false;
    }

    if (team.tier === 'ENTERPRISE') return true; // Unlimited

    // Use default limit if null
    const limit = team.aiTokenLimit ?? 1000;
    return ((limit - (team.aiUsageCount || 0)) >= cost);
  },

  /**
   * ATOMIC: Check quota AND deduct in a single database operation
   * Prevents race conditions where multiple concurrent requests bypass quota
   */
  async checkAndDeductQuota(teamId: string, cost: number): Promise<{
    allowed: boolean;
    remaining: number;
    reason?: 'insufficient_quota' | 'payment_issue' | 'enterprise_unlimited' | 'team_not_found'
  }> {
    // First check subscription status and tier
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      columns: { aiUsageCount: true, aiTokenLimit: true, tier: true, subscriptionStatus: true }
    });

    if (!team) {
      return { allowed: false, remaining: 0, reason: 'team_not_found' };
    }

    // Block if payment issue
    if (['past_due', 'canceled', 'unpaid'].includes(team.subscriptionStatus || '')) {
      console.warn(`AI Access Blocked for team ${teamId}: Payment ${team.subscriptionStatus}`);
      return { allowed: false, remaining: 0, reason: 'payment_issue' };
    }

    // Enterprise has unlimited (but still track usage)
    if (team.tier === 'ENTERPRISE') {
      await db.update(teams)
        .set({ aiUsageCount: sql`COALESCE(${teams.aiUsageCount}, 0) + ${cost}` })
        .where(eq(teams.id, teamId));
      return { allowed: true, remaining: Infinity, reason: 'enterprise_unlimited' };
    }

    // ATOMIC: Update only if sufficient quota available
    // This single statement prevents race conditions
    const result = await db.update(teams)
      .set({ aiUsageCount: sql`COALESCE(${teams.aiUsageCount}, 0) + ${cost}` })
      .where(
        and(
          eq(teams.id, teamId),
          sql`(COALESCE(${teams.aiTokenLimit}, 1000) - COALESCE(${teams.aiUsageCount}, 0)) >= ${cost}`
        )
      )
      .returning({
        remaining: sql<number>`COALESCE(${teams.aiTokenLimit}, 1000) - COALESCE(${teams.aiUsageCount}, 0)`
      });

    if (result.length === 0) {
      // Update failed = insufficient quota
      const limit = team.aiTokenLimit ?? 1000;
      const used = team.aiUsageCount ?? 0;
      return { allowed: false, remaining: limit - used, reason: 'insufficient_quota' };
    }

    return { allowed: true, remaining: result[0].remaining };
  },

  /**
   * Track token usage and update real-time billing stats
   * Replaces old deductToken and trackUsage
   */
  async trackUsage(teamId: string, tokensUsed: number) {
    try {
      // 1. Increment team usage counter
      const [updatedTeam] = await db.update(teams)
        .set({ aiUsageCount: sql`${teams.aiUsageCount} + ${tokensUsed}` })
        .where(eq(teams.id, teamId))
        .returning();

      // 2. Real-time Billing Update
      const now = new Date();
      const periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      const periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

      const config = PRICING[updatedTeam.tier as keyof typeof PRICING] || PRICING.FREE;

      // Check if billing record exists for this period
      const existingBilling = await db.query.usageBillings.findFirst({
        where: and(
          eq(usageBillings.teamId, teamId),
          eq(usageBillings.periodStart, periodStart)
        )
      });

      if (existingBilling) {
        await db.update(usageBillings)
          .set({
            tokensUsed: sql`${usageBillings.tokensUsed} + ${tokensUsed}`,
            // We don't verify overage calculate here, can be done at billing time or here if we tracked limit.
            // Since tokenLimit is not in schema, we skip overageTokens column update.
          })
          .where(eq(usageBillings.id, existingBilling.id));
      } else {
        await db.insert(usageBillings).values({
          teamId,
          periodStart,
          periodEnd,
          tokensUsed: tokensUsed,
          usageAmount: 0,
          totalAmount: 0,
          status: 'open'
        });
      }

      // 3. Check for Upsell Opportunities
      await NotificationService.checkUpsellTrigger(
        teamId,
        updatedTeam.aiUsageCount ?? 0,
        updatedTeam.aiTokenLimit ?? config.tokenLimit
      );

      return { success: true, currentUsage: updatedTeam.aiUsageCount };

    } catch (error) {
      console.error('[BillingService] Track usage error:', error);
      return { success: false, error: String(error) };
    }

  },

  async deductToken(teamId: string, tokens: number) {
    return this.trackUsage(teamId, tokens);
  },

  // ============================================================================
  // 2. STRIPE SUBSCRIPTION HANDLERS (Webhooks)
  // ============================================================================

  async handleSubscriptionChange(stripeCustomerId: string, tier: string, status: string) {
    await db.update(teams)
      .set({ tier, subscriptionStatus: status })
      .where(eq(teams.stripeCustomerId, stripeCustomerId));
  },

  async handlePaymentFailed(stripeCustomerId: string) {
    console.log(`⚠️ Payment failed for ${stripeCustomerId}. Downgrading status to past_due...`);

    // Automated Dunning Management
    await db.update(teams)
      .set({ subscriptionStatus: 'past_due' })
      .where(eq(teams.stripeCustomerId, stripeCustomerId));
  },

  // ============================================================================
  // 3. MONTHLY BILLING PROCESS (Background Job)
  // ============================================================================

  async createMonthlyBilling(teamId: string, periodStart: Date, periodEnd: Date) {
    try {
      const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId)
      });

      if (!team) throw new Error('Team not found');

      const tier = team.tier as keyof typeof PRICING;
      const config = PRICING[tier] || PRICING.FREE;

      const tokenUsage = team.aiUsageCount ?? 0;
      const overageTokens = Math.max(0, tokenUsage - config.tokenLimit);
      const usageAmount = Math.floor((overageTokens / 1000) * config.overageRate);
      const totalAmount = config.baseAmount + usageAmount;

      // Upsert billing record
      const existingBilling = await db.query.usageBillings.findFirst({
        where: and(
          eq(usageBillings.teamId, teamId),
          eq(usageBillings.periodStart, periodStart)
        )
      });

      if (existingBilling) {
        await db.update(usageBillings)
          .set({
            tokensUsed: tokenUsage,
            usageAmount,
            totalAmount,
            status: 'billed'
          })
          .where(eq(usageBillings.id, existingBilling.id));

        const billing = await db.query.usageBillings.findFirst({ where: eq(usageBillings.id, existingBilling.id) });
        console.log(`[BillingService] Updated billing for team ${teamId}: ${totalAmount}`);
        return billing;
      } else {
        const [billing] = await db.insert(usageBillings).values({
          teamId,
          periodStart,
          periodEnd,
          tokensUsed: tokenUsage,
          usageAmount,
          totalAmount,
          status: 'billed'
        }).returning();
        console.log(`[BillingService] Created billing for team ${teamId}: ${totalAmount}`);
        return billing;
      }

    } catch (error) {
      console.error('[BillingService] Create monthly billing error:', error);
      throw error;
    }
  },

  async processMonthlyBilling() {
    try {
      const now = new Date();
      const periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      const periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

      const activeTeams = await db.query.teams.findMany({
        where: sql`${teams.tier} != 'FREE'`
      });

      console.log(`[BillingService] Processing monthly billing for ${activeTeams.length} teams.`);

      const results = [];

      for (const team of activeTeams) {
        try {
          const billing = await this.createMonthlyBilling(team.id, periodStart, periodEnd);
          results.push({ teamId: team.id, success: true, billing });

          await NotificationService.broadcastToAdmins(
            team.id,
            '💳 Monthly Invoice Ready',
            `Your invoice for ${periodStart.toISOString().slice(0, 7)} is ready. Amount: Rp ${((billing?.totalAmount || 0) / 1000).toFixed(0)}k`,
            'INFO'
          );

        } catch (error) {
          console.error(`[BillingService] Failed for team ${team.id}:`, error);
          results.push({ teamId: team.id, success: false, error: String(error) });
        }
      }

      await db.update(teams).set({ aiUsageCount: 0 });
      console.log(`[BillingService] Monthly billing completed.`);

      return results;

    } catch (error) {
      console.error('[BillingService] Process monthly billing error:', error);
      throw error;
    }
  },

  async getBillingHistory(teamId: string) {
    try {
      return await db.query.usageBillings.findMany({
        where: eq(usageBillings.teamId, teamId),
        orderBy: (usageBillings, { desc }) => [desc(usageBillings.createdAt)],
        limit: 12
      });
    } catch (error) {
      console.error('[BillingService] Get billing history error:', error);
      return [];
    }
  },

  async markAsPaid(billingId: string) {
    try {
      const [billing] = await db.update(usageBillings)
        .set({ status: 'PAID' })
        .where(eq(usageBillings.id, billingId))
        .returning();
      return { success: true, billing };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  async getProjectedBill(teamId: string) {
    try {
      const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId)
      });

      if (!team) throw new Error('Team not found');

      const tier = team.tier as keyof typeof PRICING;
      const config = PRICING[tier] || PRICING.FREE;

      const currentUsage = team.aiUsageCount || 0;
      const overageTokens = Math.max(0, currentUsage - config.tokenLimit);
      const projectedOverageAmount = Math.floor((overageTokens / 1000) * config.overageRate);
      const projectedTotal = config.baseAmount + projectedOverageAmount;

      return {
        tier: team.tier,
        baseAmount: config.baseAmount,
        tokenUsage: currentUsage,
        tokenLimit: config.tokenLimit,
        overageTokens,
        projectedOverageAmount,
        projectedTotal,
        percentageUsed: Math.min(100, Math.floor((currentUsage / config.tokenLimit) * 100))
      };
    } catch (error) {
      console.error('[BillingService] Get projected bill error:', error);
      throw error;
    }
  }
};
