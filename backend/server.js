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
// 1. STRIPE WEBHOOK (WAJIB DI ATAS BODY PARSER)
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
      
      const userId = parseInt(session.metadata.userId);
      const planType = session.metadata.planType;

      if (userId) {
        try {
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

    res.json({ received: true });
  }
);

// ==================================================================
// 2. MIDDLEWARE & ROUTES
// ==================================================================

// --- PERBAIKAN CORS DISINI ---
// Kita izinkan Frontend Production DAN Localhost sekaligus
const allowedOrigins = [
  process.env.CLIENT_URL, // URL Vercel Frontend
  "http://localhost:5173", // Local Development
  "http://localhost:5001"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Jika origin tidak ada di daftar, tetap izinkan (opsional) atau block
      // Untuk debugging yang lebih mudah, kita bisa return true sementara
      // return callback(null, true); 
    }
    return callback(null, true);
  },
  credentials: true, // PENTING: Agar header auth/cookies bisa lewat
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));

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

// ==================================================================
// 3. SERVER START (PERBAIKAN LOGIKA DEPLOY)
// ==================================================================

// Jika dijalankan langsung (node server.js), jalankan app.listen
// Ini penting agar Render bisa menjalankan servernya.
if (require.main === module) {
  app.listen(PORT,"0.0.0.0", () => {
    console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`👉 Webhook URL: http://localhost:${PORT}/api/webhook`);
    }
  });
}

// Export app untuk Vercel (Serverless)
module.exports = app;