require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const { PrismaClient } = require("@prisma/client");
const paymentRoutes = require("./src/routes/paymentRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
const prisma = new PrismaClient();
// Pastikan Secret Key ada
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ ERROR: STRIPE_SECRET_KEY belum diisi di .env!");
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 5001; // Kita pakai 5001

app.use(cors());

// ==================================================================
// 1. ROUTE WEBHOOK (WAJIB PALING ATAS & RAW)
// ==================================================================
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`🔔 [WEBHOOK HIT] Event diterima: ${event.type}`);
  } catch (err) {
    console.error(`⚠️ [WEBHOOK FAIL] Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Event Pembayaran Sukses
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Ambil User ID dari Metadata
    const userId = parseInt(session.metadata?.userId); 
    console.log(`🔍 [CHECKOUT] Memproses untuk User ID: ${userId}`);

    if (userId) {
      try {
        // Update User jadi PRO
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { 
            plan: 'pro',
            stripeSubscriptionId: session.subscription, 
            cancelAtPeriodEnd: false
          }
        });
        console.log(`✅ [SUKSES] User ${updatedUser.email} sekarang adalah PRO MEMBER!`);
      } catch (error) {
        console.error("❌ [DB ERROR] Gagal update database:", error.message);
      }
    } else {
      console.warn("⚠️ [SKIPPED] Webhook diterima tapi tidak ada userId (Mungkin test trigger?)");
    }
  }

  res.json({ received: true });
});

// ==================================================================
// 2. MIDDLEWARE JSON & ROUTES LAIN
// ==================================================================
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 SERVER SIAP DI PORT ${PORT}`);
  console.log(`👉 Pastikan Stripe Listen ke: localhost:${PORT}/api/webhook\n`);
});