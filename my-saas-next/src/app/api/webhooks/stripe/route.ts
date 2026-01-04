
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { BillingService } from '@/services/billingService';
import { NotificationService } from '@/services/notificationService';
import { db } from '@/db';
import { teams, auditLogs, webhookDeliveries, webhooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { StripeLogger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/error-utils';


// SECURITY: Require Stripe keys - no empty fallbacks
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  StripeLogger.warn('STRIPE_SECRET_KEY not set - billing disabled');
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' })
  : null;

export async function POST(req: Request) {
  // Early exit if Stripe not configured
  if (!stripe || !webhookSecret) {
    StripeLogger.error('Stripe not configured');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? getErrorMessage(err) : 'Unknown error';
    StripeLogger.error('Signature verification failed', { error: message });
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // SECURITY: Replay attack protection - reject webhooks older than 5 minutes
  const MAX_WEBHOOK_AGE_SECONDS = 300; // 5 minutes
  const timestampMatch = signature.match(/t=(\d+)/);
  if (timestampMatch) {
    const webhookTimestamp = parseInt(timestampMatch[1], 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const webhookAge = currentTimestamp - webhookTimestamp;

    if (webhookAge > MAX_WEBHOOK_AGE_SECONDS) {
      StripeLogger.warn('Webhook timestamp too old - possible replay attack', {
        age: webhookAge,
        maxAge: MAX_WEBHOOK_AGE_SECONDS,
        eventId: event.id
      });
      return NextResponse.json({ error: 'Webhook timestamp too old' }, { status: 400 });
    }
  }

  // IDEMPOTENCY: Atomic insert-before-process pattern
  // Insert the delivery record FIRST to claim ownership via unique constraint
  try {
    await db.insert(webhookDeliveries).values({
      eventId: event.id,
      eventType: event.type,
      requestBody: JSON.parse(body) as Record<string, unknown>,
      responseStatus: 202, // Accepted, processing
      responseBody: 'Processing started',
      duration: 0,
      success: false // Will update to true after success
    });
  } catch (err: unknown) {
    // If unique constraint violation (23505), event already being processed
    const pgError = err as { code?: string };
    if (pgError.code === '23505') {
      StripeLogger.info('Idempotency: Event already claimed', { eventId: event.id });
      return NextResponse.json({ received: true });
    }
    throw err; // Re-throw other errors
  }

  StripeLogger.info('Processing event', { eventType: event.type, eventId: event.id });

  try {
    switch (event.type as string) {
      // ============================================================================
      // DUNNING MANAGEMENT - Payment Failed
      // ============================================================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const attemptCount = invoice.attempt_count || 1;

        StripeLogger.warn('Payment failed', { customerId, attemptCount, invoiceId: invoice.id });

        // Get team by Stripe customer ID
        const team = await db.query.teams.findFirst({
          where: eq(teams.stripeCustomerId, customerId)
        });

        if (team) {
          // Escalating dunning based on attempt count
          if (attemptCount === 1) {
            // First failure: Send friendly reminder
            await db.update(teams)
              .set({ subscriptionStatus: 'past_due' })
              .where(eq(teams.id, team.id));

            await NotificationService.broadcastToAdmins(
              team.id,
              '⚠️ Payment Failed',
              'We couldn\'t process your payment. Please update your payment method to avoid service interruption.',
              'WARNING'
            );
          } else if (attemptCount === 2) {
            // Second failure: Stronger warning
            await NotificationService.broadcastToAdmins(
              team.id,
              '🚨 Payment Still Failing',
              'Your payment has failed twice. AI features will be limited until payment is resolved.',
              'WARNING'
            );
          } else if (attemptCount >= 3) {
            // Third+ failure: Soft lock
            await db.update(teams)
              .set({ subscriptionStatus: 'unpaid' })
              .where(eq(teams.id, team.id));

            await NotificationService.broadcastToAdmins(
              team.id,
              '🔒 Account Soft-Locked',
              'Your account has been soft-locked due to failed payments. Update your payment method to restore access.',
              'WARNING'
            );
          }

          // Log the dunning event
          await db.insert(auditLogs).values({
            teamId: team.id,
            action: 'payment.failed',
            entity: 'billing',
            details: `Payment attempt #${attemptCount} failed. Invoice: ${invoice.id}`,
          });
        }
        break;
      }

      // ============================================================================
      // DUNNING RECOVERY - Payment Succeeded
      // ============================================================================
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        StripeLogger.info('Payment succeeded', { customerId, invoiceId: invoice.id });

        const team = await db.query.teams.findFirst({
          where: eq(teams.stripeCustomerId, customerId)
        });

        if (team && (team.subscriptionStatus === 'past_due' || team.subscriptionStatus === 'unpaid')) {
          // Restore access
          await db.update(teams)
            .set({ subscriptionStatus: 'active' })
            .where(eq(teams.id, team.id));

          await NotificationService.broadcastToAdmins(
            team.id,
            '✅ Payment Successful',
            'Your payment has been processed successfully. Full access has been restored.',
            'SUCCESS'
          );

          await db.insert(auditLogs).values({
            teamId: team.id,
            action: 'payment.recovered',
            entity: 'billing',
            details: `Payment recovered. Invoice: ${invoice.id}`,
          });
        }
        break;
      }

      // ============================================================================
      // SUBSCRIPTION CHANGES
      // ============================================================================
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const tier = subscription.items.data[0]?.price.lookup_key?.toUpperCase() ||
          (status === 'active' ? 'PRO' : 'FREE');

        if (subscription.customer) {
          await BillingService.handleSubscriptionChange(
            subscription.customer as string,
            tier,
            status
          );

          // Update subscription ID
          await db.update(teams)
            .set({
              stripeSubscriptionId: subscription.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
            })
            .where(eq(teams.stripeCustomerId, subscription.customer as string));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.customer) {
          await db.update(teams)
            .set({
              tier: 'FREE',
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null
            })
            .where(eq(teams.stripeCustomerId, subscription.customer as string));

          const team = await db.query.teams.findFirst({
            where: eq(teams.stripeCustomerId, subscription.customer as string)
          });

          if (team) {
            await NotificationService.broadcastToAdmins(
              team.id,
              '📋 Subscription Canceled',
              'Your subscription has been canceled. You\'ve been downgraded to the Free tier.',
              'INFO'
            );
          }
        }
        break;
      }
      // ============================================================================
      // METERED BILLING
      // ============================================================================
      case 'usage_record.summary.updated': {
        // Define inline type for usage record summary
        interface UsageRecordSummary {
          id: string;
          total_usage: number;
          subscription_item: string;
        }
        const summary = event.data.object as UsageRecordSummary;

        StripeLogger.info('Metered Usage Updated', {
          usageId: summary.id,
          totalUsage: summary.total_usage,
          subscriptionItem: summary.subscription_item
        });

        // Get subscription to find customer/team
        if (typeof summary.subscription_item === 'string') {
          try {
            const subscriptionItem = await stripe.subscriptionItems.retrieve(summary.subscription_item);
            const subscription = await stripe.subscriptions.retrieve(subscriptionItem.subscription as string);
            const customerId = subscription.customer as string;

            // Find team by Stripe customer ID
            const team = await db.query.teams.findFirst({
              where: eq(teams.stripeCustomerId, customerId)
            });

            if (team) {
              // Update team's AI usage count
              await db.update(teams)
                .set({
                  aiUsageCount: summary.total_usage
                })
                .where(eq(teams.id, team.id));

              StripeLogger.info('Usage synced to team', {
                teamId: team.id,
                totalUsage: summary.total_usage
              });
            }
          } catch (error) {
            StripeLogger.error('Failed to sync metered usage', { error });
          }
        }
        break;
      }
    }

    // Update delivery record to mark success
    await db.update(webhookDeliveries)
      .set({
        responseStatus: 200,
        responseBody: 'Processed successfully',
        success: true
      })
      .where(eq(webhookDeliveries.eventId, event.id));

    return NextResponse.json({ received: true });
  } catch (error) {
    // Update delivery record with error status
    await db.update(webhookDeliveries)
      .set({
        responseStatus: 500,
        responseBody: error instanceof Error ? error.message : 'Unknown error',
        success: false
      })
      .where(eq(webhookDeliveries.eventId, event.id));

    StripeLogger.error('Error processing event', { error });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
