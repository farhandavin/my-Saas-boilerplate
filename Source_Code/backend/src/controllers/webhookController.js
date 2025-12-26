// backend/src/controllers/webhookController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");
const { startMigrationJob } = require("../services/migrationService");

/**
 * CONFIGURATION: Map Stripe Price IDs to your Internal Tier Logic
 */
const PLAN_CONFIG = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY]: { 
    tier: "PRO", 
    limit: 50000, 
    name: "Pro Monthly" 
  },
  [process.env.STRIPE_PRICE_ENT_YEARLY]: { 
    tier: "ENTERPRISE", 
    limit: 1000000, 
    name: "Enterprise Yearly" 
  },
  "DEFAULT_FREE": { 
    tier: "FREE", 
    limit: 1000, 
    name: "Free Plan" 
  }
};

/**
 * HELPER: Determine plan details from the session
 */
const getPlanDetails = (session) => {
  // Check metadata first (if you passed it during checkout creation)
  const metaTier = session.metadata?.planType?.toUpperCase();
  
  if (metaTier === 'ENTERPRISE') return PLAN_CONFIG[process.env.STRIPE_PRICE_ENT_YEARLY];
  if (metaTier === 'PRO') return PLAN_CONFIG[process.env.STRIPE_PRICE_PRO_MONTHLY];

  // Fallback to Pro if unknown
  return PLAN_CONFIG[process.env.STRIPE_PRICE_PRO_MONTHLY] || PLAN_CONFIG["DEFAULT_FREE"];
};

/**
 * MAIN WEBHOOK HANDLER
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // 1. SECURITY: Verify the event is actually from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. ROUTING: Handle specific event types
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        // Reset usage for the new billing cycle
        await handleInvoiceSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        // Notify user or lock account features
        await handlePaymentFailed(event.data.object);
        break;

      case "customer.subscription.deleted":
        // User canceled or subscription ended
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // 3. ACKNOWLEDGMENT: Stripe needs a 200 response within a few seconds
    res.json({ received: true });

  } catch (err) {
    console.error("❌ Webhook Logic Error:", err);
    // We return 200 even on logic errors to stop Stripe from retrying 
    // indefinitely, while we fix the bug based on logs.
    res.status(200).json({ error: "Internal processing error logged." });
  }
};

// ==============================================================================
// HANDLER LOGIC
// ==============================================================================

/**
 * SCENARIO: Initial Purchase or Manual Upgrade
 */
async function handleCheckoutCompleted(session) {
  const teamId = session.client_reference_id || session.metadata?.teamId;
  
  if (!teamId) {
    console.error("❌ Error: No teamId found in session metadata or client_reference_id");
    return;
  }

  const planDetails = getPlanDetails(session);

  await prisma.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: {
        tier: planDetails.tier,
        plan: planDetails.name,
        aiTokenLimit: planDetails.limit,
        aiUsageCount: 0, // Reset usage on upgrade
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        migrationStatus: planDetails.tier === 'ENTERPRISE' ? 'PENDING' : 'NONE'
      },
    });

    await tx.auditLog.create({
      data: {
        teamId,
        userId: "SYSTEM_WEBHOOK",
        action: "SUBSCRIPTION_UPGRADE",
        details: `Upgraded to ${planDetails.tier}. Limit: ${planDetails.limit}.`,
      }
    });
  });

  // Background Job for heavy Enterprise migration
  if (planDetails.tier === 'ENTERPRISE') {
    setImmediate(() => {
      startMigrationJob(teamId).catch(err => console.error("Migration Error:", err));
    });
  }
}

/**
 * SCENARIO: Recurring Monthly Payment Successful
 */
async function handleInvoiceSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const team = await prisma.team.findFirst({
    where: { stripeSubscriptionId: subscriptionId }
  });

  if (team) {
    await prisma.team.update({
      where: { id: team.id },
      data: { aiUsageCount: 0 } // Reset token usage for the new month
    });
    console.log(`🔄 Quota reset for Team ${team.id}`);
  }
}

/**
 * SCENARIO: Payment failed (e.g., expired card)
 */
async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  const team = await prisma.team.findFirst({ where: { stripeSubscriptionId: subscriptionId } });

  if (team) {
    // Optionally: reduce limit or set a 'payment_failed' flag
    await prisma.team.update({
      where: { id: team.id },
      data: { aiTokenLimit: 0 } 
    });
    console.log(`⚠️ Payment failed for Team ${team.id}. Access restricted.`);
  }
}

/**
 * SCENARIO: Subscription Cancelled or Expired
 */
async function handleSubscriptionDeleted(subscription) {
  const team = await prisma.team.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (team) {
    const freePlan = PLAN_CONFIG["DEFAULT_FREE"];
    
    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: team.id },
        data: {
          tier: freePlan.tier,
          plan: freePlan.name,
          aiTokenLimit: freePlan.limit,
          stripeSubscriptionId: null,
        }
      });

      await tx.auditLog.create({
        data: {
          teamId: team.id,
          userId: "SYSTEM_WEBHOOK",
          action: "SUBSCRIPTION_CANCELED",
          details: "Subscription ended. Reverted to Free tier."
        }
      });
    });
  }
}