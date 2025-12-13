// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const prisma = require("./src/prismaClient");

// Import Routes
const authRoutes = require("./src/routes/authRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 5000;

// ==================================================================
// 1. STRIPE WEBHOOK (MUST BE DEFINED BEFORE BODY PARSERS)
// ==================================================================
// Stripe requires the raw body to validate the webhook signature.
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("🔔 [WEBHOOK] Signal received from Stripe");

    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      console.error("❌ [WEBHOOK ERROR] Missing signature or secret.");
      return res.status(400).send("Missing signature or secret");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ [WEBHOOK] Signature Valid. Event Type:", event.type);
    } catch (err) {
      console.error(`❌ [WEBHOOK ERROR] Verification Failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Stripe Events
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : null;
        const planType = session.metadata?.planType;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: planType || "pro",
              stripeSubscriptionId: session.subscription,
              cancelAtPeriodEnd: false,
            },
          });
          console.log(`🎉 [DB SUCCESS] User ID ${userId} upgraded to ${planType || "pro"}`);
        } else {
          console.warn("⚠️ [WEBHOOK WARN] No User ID found in metadata.");
        }
      } else {
        console.log(`ℹ️ [WEBHOOK INFO] Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error("❌ [DB ERROR] Database update failed:", error.message);
      // Return 200 to prevent Stripe from retrying endlessly on DB errors
      return res.json({ received: true });
    }

    res.json({ received: true });
  }
);

// ==================================================================
// 2. MIDDLEWARE & ROUTES
// ==================================================================
app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // Secure CORS
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("🚀 SaaS Boilerplate API is running...");
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log(`👉 Webhook URL: http://localhost:${PORT}/api/webhook`);
});