// backend/src/routes/authRoutes.js
const express = require("express");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// Import Controllers
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword 
} = require("../controllers/authController");

const router = express.Router();

// =========================================================
// 1. STANDARD AUTH (Email/Password)
// =========================================================

// Registration
router.post("/register", register);

// Login
router.post("/login", login);

// Get Current User (Protected)
router.get("/me", verifyToken, getMe);

// Password Recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// =========================================================
// 2. SOCIAL AUTH (Google OAuth)
// =========================================================

// A. Trigger: Redirects user to Google's Consent Screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// B. Callback: Google sends the user back here
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // 1. Get User from Passport (req.user is set by the strategy)
    const user = req.user;

    // 2. Generate Token Manually
    // We do this here because we bypassed the standard login controller
    const token = jwt.sign(
      { userId: user.id }, // Payload matches your authMiddleware
      process.env.JWT_SECRET,
      { expiresIn: "7d" }  // Token validity
    );

    // 3. Safe Redirect Logic
    // Uses CLIENT_URL from .env, falls back to localhost for dev
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    
    // Redirect to a dedicated success page on frontend with the token
    res.redirect(`${clientUrl}/auth/success?token=${token}`);
  }
);

module.exports = router;