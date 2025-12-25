// src/controllers/paymentController.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

const PLANS = {
  Pro: process.env.STRIPE_PRICE_PRO,
  Team: process.env.STRIPE_PRICE_TEAM
};

// Fungsi pembantu untuk validasi owner
const validateTeamOwner = async (userId, teamId) => {
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
    include: { team: true }
  });
  if (!member || member.role !== 'OWNER') {
    throw new Error("Hanya OWNER yang dapat mengelola tagihan tim.");
  }
  return member.team;
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { userId } = req.user;
    const { priceId, teamId } = req.body;
    const team = await validateTeamOwner(userId, teamId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: team.stripeCustomerId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard/${team.slug}/billing?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/${team.slug}/billing?canceled=true`,
      metadata: { teamId: team.id, planType: priceId === PLANS.Team ? "Team" : "Pro" }
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPortalSession = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await validateTeamOwner(req.user.userId, teamId);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: team.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/${team.slug}/billing`,
    });
    res.json({ url: portalSession.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await validateTeamOwner(req.user.userId, teamId);
    if (!team.stripeSubscriptionId) return res.status(400).json({ error: "Tidak ada langganan aktif." });

    await stripe.subscriptions.update(team.stripeSubscriptionId, { cancel_at_period_end: true });
    res.json({ message: "Langganan akan berhenti di akhir periode." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resumeSubscription = async (req, res) => {
  try {
    const { teamId } = req.body;
    const team = await validateTeamOwner(req.user.userId, teamId);
    await stripe.subscriptions.update(team.stripeSubscriptionId, { cancel_at_period_end: false });
    res.json({ message: "Langganan berhasil dilanjutkan!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};