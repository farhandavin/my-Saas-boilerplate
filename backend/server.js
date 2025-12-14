// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const prisma = require("./src/prismaClient");

// Import Routes
const authRoutes = require("./src/routes/authRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const teamRoutes = require("./src/routes/teamRoutes");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 5000;

// ==================================================================
// 1. STRIPE WEBHOOK (MUST BE DEFINED BEFORE BODY PARSERS)
// ==================================================================
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Ambil data dari Metadata yang dikirim paymentController tadi
      const userId = parseInt(session.metadata.userId);
      const planType = session.metadata.planType; // "Pro" atau "Team"

      if (userId) {
        try {
          // UPDATE TABEL USER (Sekarang kolomnya sudah ada!)
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: planType, 
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: "active",
              cancelAtPeriodEnd: false
            },
          });
          console.log(`✅ User ${userId} upgraded to ${planType}`);
        } catch (dbError) {
          console.error("❌ Database Update Failed:", dbError);
        }
      }
    }
    // Handle Cancel / Update Subscription events jika perlu di masa depan...

    res.json({ received: true });
  }
);

// ==================================================================
// 2. MIDDLEWARE & ROUTES
// ==================================================================
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/teams", teamRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("🚀 SaaS Boilerplate API is running...");
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log(`👉 Webhook URL: http://localhost:${PORT}/api/webhook`);
});
}

module.exports = app;