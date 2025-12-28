// src/services/paymentService.ts
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-18.acacia',
});

export const PaymentService = {
  // Validate team ownership for billing operations
  async validateTeamOwner(userId: string, teamId: string) {
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
      include: { team: true }
    });

    if (!member || member.role !== 'OWNER') {
      throw new Error('Only team owners can manage billing');
    }

    return member.team;
  },

  // Create Stripe Checkout Session
  async createCheckoutSession(data: {
    userId: string;
    email: string;
    teamId: string;
    priceId: string;
    planType?: string;
  }) {
    const { userId, email, teamId, priceId, planType = 'PRO' } = data;

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

      await prisma.team.update({
        where: { id: team.id },
        data: { stripeCustomerId: customerId }
      });
    }

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
    });

    return { url: session.url, id: session.id };
  },

  // Create Customer Portal Session
  async createPortalSession(userId: string, teamId: string) {
    const team = await this.validateTeamOwner(userId, teamId);

    if (!team.stripeCustomerId) {
      throw new Error('This team has no billing history');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: team.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
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

    await prisma.auditLog.create({
      data: {
        teamId,
        userId,
        action: 'SUBSCRIPTION_CANCELLED',
        details: 'Subscription will cancel at end of billing period'
      }
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

    await prisma.auditLog.create({
      data: {
        teamId,
        userId,
        action: 'SUBSCRIPTION_RESUMED',
        details: 'Subscription cancellation reversed'
      }
    });

    return { message: 'Subscription successfully resumed' };
  }
};
