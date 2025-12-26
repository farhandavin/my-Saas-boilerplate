const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
require("./config/passport"); // Load Passport strategies

// Load Environment Variables
dotenv.config();

// Load Routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const teamRoutes = require("./routes/teamRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Trust Proxy: Required for Rate Limit & IP tracking on platforms like Vercel/Heroku/AWS
app.set("trust proxy", 1); 

// ==================================================================
// 1. SECURITY & CONFIG MIDDLEWARE
// ==================================================================
app.use(helmet()); // Secure HTTP Headers

// Rate Limiting to prevent DDoS / Brute Force
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", limiter);

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  process.env.CLIENT_URL 
].filter(Boolean); // Remove undefined/null if CLIENT_URL isn't set yet

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'), false);
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));

// ==================================================================
// 2. STRIPE WEBHOOK (CRITICAL: MUST BE BEFORE express.json)
// ==================================================================
/**
 * ⚠️ WARNING: Stripe requires the raw request body (Buffer) to verify signatures.
 * express.json() converts the body to an object, which breaks verification.
 */
app.use(
  "/api/webhook", 
  express.raw({ type: "application/json" }), 
  webhookRoutes
);

// ==================================================================
// 3. GLOBAL BODY PARSERS (FOR ALL OTHER API ROUTES)
// ==================================================================
// These will NOT run for /api/webhook because it was handled above
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Prevent HTTP Parameter Pollution
app.use(hpp());

// ==================================================================
// 4. MAIN API ROUTES
// ==================================================================
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/keys", require("./routes/apiKeyRoutes"));
app.use("/v1", require("./routes/publicRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
// Health Check
app.get("/", (req, res) => {
  res.json({ 
    status: "success", 
    message: "🚀 SaaS Boilerplate API is running...",
    env: process.env.NODE_ENV 
  });
});

// ==================================================================
// 5. GLOBAL ERROR HANDLER
// ==================================================================
app.use((err, req, res, next) => {
  console.error(`❌ Error Detail: ${err.stack || err.message}`);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Hide stack trace in production for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ==================================================================
// 6. START SERVER
// ==================================================================
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ SERVER ACTIVE ON PORT ${PORT}`);
    console.log(`📡 MODE: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;