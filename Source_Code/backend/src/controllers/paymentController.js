// src/controllers/paymentController.js

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

const PLANS = {
  Pro: process.env.STRIPE_PRICE_PRO,
  Team: process.env.STRIPE_PRICE_TEAM
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.userId; // Pastikan ini sesuai dengan token user Anda
    const { priceId } = req.body;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // --- [FIX: VALIDASI PRICE ID] ---
    if (!priceId) {
      return res.status(400).json({ 
        error: "Price ID is missing. Check your Frontend .env configuration." 
      });
    }
    // -------------------------------

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validasi Price ID agar user tidak mengirim ID harga palsu
    let planName = "Pro";
    if (priceId === PLANS.Team) {
       planName = "Team";
    } 
    // Opsional: Cek apakah ID valid sesuai env backend
    // else if (priceId !== PLANS.Pro) {
    //   return res.status(400).json({ error: "Invalid Price ID" });
    // }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      customer: user.stripeCustomerId || undefined, 
      line_items: [{ price: priceId, quantity: 1 }], // <--- Disini errornya tadi
      success_url: `${clientUrl}/dashboard?success=true`,
      cancel_url: `${clientUrl}/dashboard?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planType: planName
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error); // Log error biar kelihatan di terminal
    res.status(500).json({ error: error.message });
  }
};

// [FITUR PREMIUM] Customer Portal
// Memungkinkan user ganti kartu kredit / download invoice sendiri
exports.createPortalSession = async (req, res) => {
  const userId = req.user.userId;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: "No billing history found." });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${clientUrl}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [FITUR PREMIUM] Cancel Subscription via API
exports.cancelSubscription = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found." });
    }

    // Call Stripe: "Cancel at period end" (User tetap bisa pakai sampai masa aktif habis)
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update Local DB segera (Optimistic UI)
    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: true },
    });

    res.json({
      message: "Subscription will end at the end of the current period.",
      subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// [FITUR PREMIUM] Resume Subscription
exports.resumeSubscription = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: "No subscription to resume." });
    }

    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: false },
    });

    res.json({ message: "Subscription resumed successfully!", subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};