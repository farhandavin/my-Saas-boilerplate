const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCheckoutSession = async (req, res) => {
  const { userId } = req.body;

  // [LOG LANGKAH 1]
  console.log(`\n🔵 [1. PAYMENT-INIT] Request masuk untuk User ID: ${userId}`);

  if (!userId) {
    console.error("❌ [ERROR] User ID tidak dikirim dari frontend!");
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // [LOG LANGKAH 2]
    console.log(`🔍 [2. DB-CHECK] Mencari user di database...`);

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      console.error(`❌ [ERROR] User ID ${userId} tidak ditemukan di DB!`);
      return res.status(404).json({ error: "User not found" });
    }

    // [LOG LANGKAH 3]
    console.log(
      `✅ [3. USER-FOUND] User ditemukan: ${user.email}. Membuat sesi Stripe...`
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pro Plan Subscription",
            },
            unit_amount: 1000,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      // [LOG LANGKAH 4 - PENTING]
      // Metadata ini adalah "Surat Titipan" untuk Webhook nanti
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

    // [LOG LANGKAH 5]
    console.log(`🚀 [4. STRIPE-READY] Link Checkout berhasil dibuat!`);
    console.log(`🎫 [INFO] Session ID: ${session.id}`);

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ [FATAL ERROR] Gagal membuat sesi:", error.message);
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
