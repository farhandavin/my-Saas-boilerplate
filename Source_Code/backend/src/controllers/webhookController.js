const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

const PLAN_LIMITS = {
  Free: 10,
  Pro: 500,
  Team: 2000
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency Check (Opsional tapi bagus)
  // ... (kode idempotency Anda oke)

  try {
    // Handle Checkout Success
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const teamId = session.metadata?.teamId; // Ambil Team ID
      const planType = session.metadata?.planType || "Pro";

      if (teamId) {
        // UPDATE TEAM, BUKAN USER
        await prisma.team.update({
          where: { id: teamId },
          data: {
            plan: planType,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            aiLimitMax: PLAN_LIMITS[planType] || 10
          },
        });
        console.log(`✅ Team ${teamId} upgraded to ${planType}`);
      }
    }

    // Handle Subscription Deleted / Cancelled
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      // Cari tim berdasarkan subscription ID
      const team = await prisma.team.findFirst({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (team) {
        await prisma.team.update({
          where: { id: team.id },
          data: {
            plan: "Free",
            aiLimitMax: PLAN_LIMITS["Free"],
            stripeSubscriptionId: null
          }
        });
        console.log(`Team ${team.id} downgraded to Free`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Logic Error:", err);
    res.status(500).json({ error: "Internal Error" });
  }
};