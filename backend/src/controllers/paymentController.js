const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCheckoutSession = async (req, res) => {
  const { userId } = req.body;

  console.log(`➡️  Menerima request checkout untuk User ID: ${userId}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    // Validasi User
    if (!user) {
      console.error("❌ User tidak ditemukan di Database!");
      return res.status(404).json({ error: "User not found" });
    }

    // Buat Session
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
      // Metadata (KUNCI UTAMA AGAR PRO BERHASIL)
      metadata: {
        userId: userId.toString(),
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
        },
      },
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
    });

    console.log(`✅ Link Checkout Berhasil Dibuat! Session ID: ${session.id}`);
    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Gagal membuat session:", error);
    res.status(500).json({ error: error.message });
  }
};
