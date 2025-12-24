// backend/src/controllers/webhookController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

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
    console.error(`⚠️  Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 1. IDEMPOTENCY CHECK
  const eventExists = await prisma.webhookEvent.findUnique({
    where: { id: event.id },
  });

  if (eventExists) {
    return res.json({ received: true });
  }

  // 2. HANDLE EVENT
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId ? parseInt(session.metadata.userId, 10) : null;
      const planType = session.metadata?.planType;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: planType,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: "active",
            cancelAtPeriodEnd: false
          },
        });
        console.log(`✅ User ${userId} upgraded to ${planType}`);
      }
    }

    // 3. SIMPAN EVENT ID
    await prisma.webhookEvent.create({
      data: { id: event.id }
    });

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook Logic Error:", err);
    res.status(200).json({ error: "Webhook processed with internal errors" });
  }
};