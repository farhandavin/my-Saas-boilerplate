
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
require("./config/passport"); // Load konfigurasi passport
 dotenv.config();
// Load Routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const teamRoutes = require("./routes/teamRoutes");
const webhookRoutes = require("./routes/webhookRoutes");


const app = express();
app.set("trust proxy", 1); // Penting jika dideploy di balik proxy (Vercel/Heroku/Nginx)
const PORT = process.env.PORT || 5001;

// ==================================================================
// 1. SECURITY MIDDLEWARE
// ==================================================================
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100, 
  message: { success: false, message: "Terlalu banyak request, coba lagi nanti." }
});
app.use("/api", limiter);

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Pastikan ini persis sama dengan URL di browser Anda
  process.env.CLIENT_URL
];

app.use(cors({
  origin: (origin, callback) => {
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
// 2. STRIPE WEBHOOK (KHUSUS: RAW BODY)
// ==================================================================
// Gunakan .use jika didalam webhookRoutes.js sudah ada definisi router.post('/')
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRoutes);

// ==================================================================
// 3. BODY PARSER (SETELAH WEBHOOK)
// ==================================================================
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp());

// ==================================================================
// 4. API ROUTES
// ==================================================================
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/teams", teamRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "success", message: "🚀 SaaS Boilerplate API is running..." });
});

// ==================================================================
// 5. GLOBAL ERROR HANDLER
// ==================================================================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ==================================================================
// 6. START SERVER
// ==================================================================
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ SERVER ACTIVE ON PORT ${PORT}`);
    console.log(`📡 ENVIRONMENT: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;