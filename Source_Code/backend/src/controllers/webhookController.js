const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");
const { startMigrationJob } = require("../services/migrationService"); // Import Service

const PLAN_LIMITS = {
  Free: 10,
  Pro: 500,
  Enterprise: 999999 // Unlimited / Custom
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

  try {
    // ====================================================
    // 1. HANDLE CHECKOUT (Upgrade Plan)
    // ====================================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const teamId = session.metadata?.teamId;
      const planType = session.metadata?.planType || "Pro"; // Pastikan metadata dikirim dari frontend

      if (teamId) {
        console.log(`💰 Payment received for Team ${teamId} -> Plan ${planType}`);

        // Update Data Dasar dulu
        await prisma.team.update({
          where: { id: teamId },
          data: {
            plan: planType, // Nama Plan untuk display
            tier: planType === 'Enterprise' ? 'ENTERPRISE' : 'PRO', // Logic Tier
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            aiLimitMax: PLAN_LIMITS[planType] || 10
          },
        });

        // TRIGGER MIGRATION KHUSUS ENTERPRISE
        if (planType === 'Enterprise') {
            // Jalankan di background (setImmediate) agar Webhook tidak timeout (Stripe timeout 30s)
            setImmediate(() => {
                startMigrationJob(teamId);
            });
            console.log(`⚙️ Enterprise Migration triggered for ${teamId}`);
        }
      }
    }

    // ====================================================
    // 2. HANDLE RECURRING PAYMENT (Reset AI Quota)
    // ====================================================
    if (event.type === "invoice.payment_succeeded") {
      const subscriptionId = event.data.object.subscription;
      
      // Cari tim yang punya subscription ini
      const team = await prisma.team.findFirst({
        where: { stripeSubscriptionId: subscriptionId }
      });

      if (team) {
        // Reset Usage Count jadi 0 setiap bulan saat bayar sukses
        await prisma.team.update({
          where: { id: team.id },
          data: { aiUsageCount: 0 }
        });
        console.log(`🔄 Monthly Quota Reset for Team ${team.id}`);
      }
    }

    // ====================================================
    // 3. HANDLE PAYMENT FAILED (Lock Account)
    // ====================================================
    if (event.type === "invoice.payment_failed") {
      const subscriptionId = event.data.object.subscription;
      const team = await prisma.team.findFirst({
        where: { stripeSubscriptionId: subscriptionId }
      });

      if (team) {
        // Downgrade atau Kunci
        await prisma.team.update({
          where: { id: team.id },
          data: { 
            aiLimitMax: 0 // Stop akses AI sampai lunas
          }
        });
        console.log(`⚠️ Payment Failed. Service paused for Team ${team.id}`);
      }
    }

    // ====================================================
    // 4. HANDLE CANCELLATION
    // ====================================================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const team = await prisma.team.findFirst({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (team) {
        await prisma.team.update({
          where: { id: team.id },
          data: {
            plan: "Free",
            tier: "Free",
            aiLimitMax: PLAN_LIMITS["Free"],
            stripeSubscriptionId: null,
            // Opsional: Balikin databaseUrl ke null jika downgrade dari Enterprise (Kompleks)
          }
        });
        console.log(`📉 Team ${team.id} downgraded to Free`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook Logic Error:", err);
    res.status(500).json({ error: "Internal Error" });
  }
};