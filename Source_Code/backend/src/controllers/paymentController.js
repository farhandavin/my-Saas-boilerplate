const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

const PLANS = {
  Pro: process.env.STRIPE_PRICE_PRO,
  Team: process.env.STRIPE_PRICE_TEAM
};

if (!PLANS.Pro || !PLANS.Team) {
  console.warn("WARNING: Stripe Price IDs are missing in .env file.");
}

exports.createCheckoutSession = async (req, res) => {
  const { userId, priceId } = req.body;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Tentukan nama plan berdasarkan priceId
    let planName = "Pro";
    if (priceId === PLANS.Team) planName = "Team";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientUrl}/dashboard?success=true`,
      cancel_url: `${clientUrl}/dashboard?canceled=true`,
      metadata: {
        userId: userId.toString(), // PENTING: ID ini dipakai webhook untuk update DB
        planType: planName         // PENTING: Nama plan yang akan disimpan ke DB
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription found." });
    }

    // Call Stripe: "Cancel at period end"
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update Local DB immediately (for faster UI updates)
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

// ADDITION: RESUME SUBSCRIPTION
exports.resumeSubscription = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      return res
        .status(400)
        .json({ error: "No subscription to resume." });
    }

    // Call Stripe: "Do not cancel (cancel_at_period_end = false)"
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

exports.createPortalSession = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      return res
        .status(400)
        .json({ error: "User does not have an active subscription." });
    }

    // We need the Stripe Customer ID.
    // Note: Since we only stored Subscription ID, we fetch the subscription object first.
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error("Failed to create portal session:", error);
    res.status(500).json({ error: error.message });
  }
};