// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const { PrismaClient } = require("@prisma/client");

// Import Routes
const paymentRoutes = require("./src/routes/paymentRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = 5001; // Sesuai permintaan (Port 5001)

// ==================================================================
// 1. ROUTE WEBHOOK (WAJIB PALING ATAS & RAW BODY)
// ==================================================================
// Stripe butuh body mentah untuk validasi signature
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // 🔍 1. Cek apakah request masuk
    console.log("🔔 [WEBHOOK] Sinyal masuk dari Stripe!");

    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // 🔍 2. Cek kelengkapan Secret & Signature
    if (!sig || !endpointSecret) {
      console.error("❌ [WEBHOOK FAIL] Signature atau Secret kosong.");
      return res.status(400).send("Missing signature or secret");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      // 🔍 3. Jika lolos sini, berarti koneksi aman
      console.log("✅ [WEBHOOK] Signature Valid. Event Type:", event.type);
    } catch (err) {
      console.error(`❌ [WEBHOOK ERROR] Gagal Verifikasi: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Event
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = parseInt(session.metadata?.userId);

        console.log("📦 [WEBHOOK DATA] Session ID:", session.id);
        console.log(
          "👤 [WEBHOOK DATA] Metadata User ID:",
          session.metadata?.userId
        );

        if (userId) {
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "pro",
              stripeSubscriptionId: session.subscription,
              cancelAtPeriodEnd: false,
            },
          });
          console.log(
            `🎉 [DB SUCCESS] User ${updatedUser.email} berhasil di-upgrade ke PRO!`
          );
        } else {
          console.warn("⚠️ [WEBHOOK WARN] Tidak ada User ID di metadata.");
        }
      } else {
        console.log(`ℹ️ [WEBHOOK INFO] Event ${event.type} diabaikan.`);
      }
    } catch (error) {
      console.error("❌ [DB ERROR] Gagal update database:", error.message);
      // Kembalikan 200 supaya Stripe tidak mengulang request terus menerus meski DB error
      return res.json({ received: true });
    }

    res.json({ received: true });
  }
);

app.use(cors());
app.use(express.json()); // Parsing JSON untuk route selain webhook

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log(`👉 Webhook URL: http://localhost:${PORT}/api/webhook`);
});
