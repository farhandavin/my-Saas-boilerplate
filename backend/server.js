const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Stripe = require("stripe");
const { PrismaClient } = require("@prisma/client");
const authRoutes = require("./src/routes/authRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());

// ==================================================================
//  🕵️‍♂️ WEBHOOK DETECTIVE (Logging Super Lengkap)
// ==================================================================
// --- GANTI BAGIAN WEBHOOK DI SERVER.JS DENGAN INI ---

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  // 1. CEK APAKAH REQUEST MASUK?
  console.log("\n🔔 [WEBHOOK HIT] Ada paket datang ke /api/webhook!");

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // 2. CEK VERIFIKASI
    console.log("🔐 [SECURITY] Tanda tangan Stripe VALID.");
  } catch (err) {
    console.error(`⚠️ [SECURITY FAIL] Tanda tangan PALSU/RUSAK: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 3. CEK TIPE EVENT YANG MASUK
  console.log(`📦 [EVENT TYPE] Jenis Event: ${event.type}`);

  // Handle Event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log("➡️ Metadata Raw:", JSON.stringify(session.metadata, null, 2));
    
    // Ambil userId
    const userId = parseInt(session.metadata?.userId);
    console.log(`➡️ UserId Hasil Parsing: ${userId} (Tipe: ${typeof userId})`);

    if (userId) {
      console.log(`✅ [ACTION] User ID valid. Mencoba update DB...`);
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { 
            plan: 'pro',
            stripeSubscriptionId: session.subscription, 
            cancelAtPeriodEnd: false
          }
        });
        console.log("🎉 [DB SUCCESS] User berhasil di-upgrade ke PRO:", updatedUser.email);
      } catch (err) {
        console.error("❌ [DB ERROR] Gagal update database:", err.message);
      }
    } else {
      console.warn("⚠️ [SKIPPED] UserId kosong atau tidak valid.");
    }

  } else {
    console.log(`ℹ️ [IGNORED] Event tipe '${event.type}' diabaikan (bukan target kita).`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// ==================================================================

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`💻 Server Siap di Port ${PORT}. Menunggu aktivitas...`)
);
