
// src/services/paymentService.ts
import Stripe from 'stripe';
import { db } from '@/db';
import { teamMembers, teams, auditLogs, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const PaymentService = {
  // Validate team ownership for billing operations
  async validateTeamOwner(userId: string, teamId: string) {
    // Check key
    const member = await db.query.teamMembers.findFirst({
        where: and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
    });

    if (!member || member.role !== 'ADMIN') {
      throw new Error('Only team admins can manage billing');
    }

    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
    if (!team) throw new Error('Team not found');

    return team;
  },

  // Create Stripe Checkout Session
  async createCheckoutSession(data: {
    userId: string;
    email: string;
    teamId: string;
    priceId: string;
    planType?: string;
    returnUrlBase?: string;
  }) {
    const { userId, email, teamId, priceId, planType = 'PRO', returnUrlBase } = data;

    const team = await this.validateTeamOwner(userId, teamId);

    // Get or create Stripe customer
    let customerId = team.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: team.name,
        metadata: { teamId: team.id }
      });
      customerId = customer.id;

      await db.update(teams)
        .set({ stripeCustomerId: customerId })
        .where(eq(teams.id, team.id));
    }

    // Use provided origin (e.g. localhost:3001) or fallback to env var
    const baseUrl = returnUrlBase || process.env.NEXT_PUBLIC_APP_URL;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: team.id,
      metadata: {
        teamId: team.id,
        planType
      },
      // Use a consistent default locale for now, or fetch from user preference if available
      success_url: `${baseUrl}/en/dashboard?payment=success`,
      cancel_url: `${baseUrl}/en/pricing?payment=cancelled`,
    });

    return { url: session.url, id: session.id };
  },

  // Create Customer Portal Session
  async createPortalSession(userId: string, teamId: string, returnUrlBase?: string) {
    const team = await this.validateTeamOwner(userId, teamId);

    // FIX: If team has no stripeCustomerId, CREATE one now instead of throwing error
    if (!team.stripeCustomerId) {
       // Fetch user email to use for customer creation
       const [user] = await db.select().from(users).where(eq(users.id, userId));
       const email = user?.email || team.supportEmail || `admin-${teamId}@example.com`;

       const customer = await stripe.customers.create({
         email: email,
         name: team.name,
         metadata: { teamId: team.id }
       });
       
       await db.update(teams)
        .set({ stripeCustomerId: customer.id })
        .where(eq(teams.id, team.id));
        
       team.stripeCustomerId = customer.id;
    }

    // Use provided origin (e.g. localhost:3001) or fallback to env var
    const baseUrl = returnUrlBase || process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.billingPortal.sessions.create({
      customer: team.stripeCustomerId!,
      return_url: `${baseUrl}/en/dashboard`,
    });

    return { url: session.url };
  },

  // Cancel Subscription
  async cancelSubscription(userId: string, teamId: string) {
    const team = await this.validateTeamOwner(userId, teamId);

    if (!team.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    await stripe.subscriptions.update(team.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await db.insert(auditLogs).values({
        teamId,
        userId,
        action: 'SUBSCRIPTION_CANCELLED',
        entity: 'subscription',
        details: 'Subscription will cancel at end of billing period'
    });

    return { message: 'Subscription will cancel at the end of the billing cycle' };
  },

  // Resume Cancelled Subscription
  async resumeSubscription(userId: string, teamId: string) {
    const team = await this.validateTeamOwner(userId, teamId);

    if (!team.stripeSubscriptionId) {
      throw new Error('No subscription record found');
    }

    await stripe.subscriptions.update(team.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    await db.insert(auditLogs).values({
        teamId,
        userId,
        action: 'SUBSCRIPTION_RESUMED',
        entity: 'subscription',
        details: 'Subscription cancellation reversed'
    });

    return { message: 'Subscription successfully resumed' };
  }
};
