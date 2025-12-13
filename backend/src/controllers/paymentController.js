const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = require("../prismaClient");

exports.createCheckoutSession = async (req, res) => {
  // Tambahkan priceId di sini
  const { userId, priceId } = req.body; 

  if (!userId || !priceId) {
    return res.status(400).json({ error: "User ID dan Price ID wajib ada!" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId, // 👈 GUNAKAN VARIABLE INI (JANGAN HARDCODE)
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        source: "paymentController",
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
        },
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: "Tidak ada langganan aktif." });
    }

    // Panggil Stripe: "Jangan perpanjang nanti (cancel_at_period_end = true)"
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update DB Lokal langsung (biar UI cepat update)
    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: true },
    });

    res.json({
      message: "Langganan akan berhenti pada akhir periode.",
      subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// TAMBAHAN: RESUME SUBSCRIPTION
exports.resumeSubscription = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeSubscriptionId) {
      return res
        .status(400)
        .json({ error: "Tidak ada langganan untuk dilanjutkan." });
    }

    // Panggil Stripe: "Lanjut lagi dong (cancel_at_period_end = false)"
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    await prisma.user.update({
      where: { id: userId },
      data: { cancelAtPeriodEnd: false },
    });

    res.json({ message: "Langganan berhasil dilanjutkan!", subscription });
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
        .json({ error: "User tidak memiliki langganan aktif." });
    }

    // Kita butuh Customer ID Stripe.
    // Catatan: Di implementasi Anda saat ini, Anda menyimpan Subscription ID, bukan Customer ID.
    // Kita harus ambil subscription dari Stripe dulu untuk dapat Customer ID-nya.
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error("Gagal membuat portal session:", error);
    res.status(500).json({ error: error.message });
  }
};
