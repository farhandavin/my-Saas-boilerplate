const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

// Limit AI berdasarkan Plan (Sesuaikan dengan kebijakan bisnis Anda)
const PLAN_AI_LIMITS = {
  Free: 10,
  Pro: 500,
  Team: 2000
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verifikasi event asli dari Stripe
    event = stripe.webhooks.constructEvent(
      req.body, // Pastikan body-parser di server.js menggunakan {type: 'application/json'} untuk route ini atau raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Event
  switch (event.type) {
    // 1. Checkout Berhasil (Subscription Baru)
    case "checkout.session.completed":
      const session = event.data.object;
      const teamId = session.metadata.teamId;
      const planType = session.metadata.planType || "Pro";
      
      if (teamId) {
        await prisma.team.update({
          where: { id: teamId },
          data: {
            stripeSubscriptionId: session.subscription,
            plan: planType,
            aiLimitMax: PLAN_AI_LIMITS[planType] || 10
          }
        });
        console.log(`Team ${teamId} upgraded to ${planType}`);
      }
      break;

    // 2. Pembayaran Gagal / Subscription Dibatalkan
    case "customer.subscription.deleted":
      const subscription = event.data.object;
      const teamIdSub = subscription.metadata.teamId; // Pastikan metadata ada saat create sub
      
      // Jika metadata kosong, kita cari berdasarkan stripeSubscriptionId
      const teamToDowngrade = teamIdSub 
        ? { id: teamIdSub } 
        : await prisma.team.findFirst({ where: { stripeSubscriptionId: subscription.id } });

      if (teamToDowngrade) {
        await prisma.team.update({
          where: { id: teamToDowngrade.id },
          data: {
            plan: "Free",
            aiLimitMax: PLAN_AI_LIMITS["Free"],
            stripeSubscriptionId: null
          }
        });
        console.log(`Team ${teamToDowngrade.id || teamIdSub} downgraded to Free`);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
};