// src/controllers/paymentController.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../config/prismaClient");

const PLANS = {
  Pro: process.env.STRIPE_PRICE_PRO,
  Team: process.env.STRIPE_PRICE_TEAM
};

// Helper: Validasi Owner
const validateTeamOwner = async (userId, teamId) => {
  if (!teamId) throw new Error("Team ID wajib diisi.");
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
    include: { team: true }
  });
  if (!member || member.role !== 'OWNER') {
    throw new Error("Akses ditolak. Hanya OWNER yang bisa mengatur tagihan.");
  }
  return member.team;
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const { userId } = req.user;
    const { priceId, teamId } = req.body;
    const team = await validateTeamOwner(userId, teamId);

    let planName = "Pro";
    if (priceId === PLANS.Team) planName = "Team";

    let customerId = team.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: team.name,
        metadata: { teamId: team.id }
      });
      customerId = customer.id;
      await prisma.team.update({ where: { id: team.id }, data: { stripeCustomerId: customerId }});
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard/${team.slug}/billing?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/${team.slug}/billing?canceled=true`,
      metadata: { teamId: team.id, planType: planName }
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
    if (!team.stripeCustomerId) return res.status(400).json({ error: "Belum ada riwayat tagihan." });

    const session = await stripe.billingPortal.sessions.create({
      customer: team.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/${team.slug}/billing`,
    });
    res.json({ url: session.url });
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
    if (!team.stripeSubscriptionId) return res.status(400).json({ error: "Tidak ada langganan." });

    await stripe.subscriptions.update(team.stripeSubscriptionId, { cancel_at_period_end: false });
    res.json({ message: "Langganan berhasil dilanjutkan." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};  