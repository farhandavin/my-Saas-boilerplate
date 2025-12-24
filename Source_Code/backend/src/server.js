// src/app.js (atau server.js)

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet"); // Security Headers
const rateLimit = require("express-rate-limit"); // Brute force protection
const hpp = require("hpp"); // Prevent HTTP Parameter Pollution
const stripe = require("stripe"); // Import Stripe Library langsung disini untuk webhook


// Load Routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const teamRoutes = require("./routes/teamRoutes");
const prisma = require("./config/prismaClient");
require("./config/passport");

dotenv.config();
const webhookController = require("./controllers/webhookController");
// Inisialisasi Stripe dengan Secret Key
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5001;

// ==================================================================
// 1. SECURITY & CONFIG (ENVATO COMPLIANT)
// ==================================================================

// A. Security Headers
app.use(helmet());

// B. Rate Limiting (Mencegah Brute Force)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 100, // Limit request per IP
  message: { success: false, message: "Terlalu banyak request, coba lagi nanti." }
});
app.use("/api", limiter);

// C. CORS Configuration (Strict)
const allowedOrigins = [
  process.env.CLIENT_URL, // e.g. https://myapp.vercel.app
  "http://localhost:5173", // Local Frontend
  "http://localhost:5001"  // Local Backend test
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow request with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      // Block request dari origin asing
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));

// ==================================================================
// 2. STRIPE WEBHOOK (PENTING: Harus SEBELUM express.json)
// ==================================================================
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookController.handleStripeWebhook
);

// ==================================================================
// 3. BODY PARSER & GENERAL MIDDLEWARE
// ==================================================================

// Parsing Body JSON (Hanya berjalan setelah Webhook lewat)
app.use(express.json({ limit: '10kb' })); 

// Parameter Pollution Protection
app.use(hpp());

// ==================================================================
// 4. API ROUTES
// ==================================================================

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes); // Konsisten pakai 'payments' jamak
app.use("/api/ai", aiRoutes);
app.use("/api/teams", teamRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("🚀 SaaS Boilerplate API is running...");
});

// ==================================================================
// 5. GLOBAL ERROR HANDLER (WAJIB PALING BAWAH)
// ==================================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    // Jangan tampilkan stack di production (Envato requirement)
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ==================================================================
// 6. SERVER START
// ==================================================================

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`👉 Webhook URL: http://localhost:${PORT}/api/webhook`);
    }
  });
}

module.exports = app;