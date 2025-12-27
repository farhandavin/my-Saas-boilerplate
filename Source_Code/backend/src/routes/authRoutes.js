// backend/src/routes/authRoutes.js
const express = require("express");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// Import Controller (Gunakan satu cara saja agar tidak membingungkan)
const authController = require("../controllers/authController");

const router = express.Router();

// =========================================================
// 1. STANDARD AUTH (Email/Password)
// =========================================================

// Registration
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Get Current User (Protected)
router.get("/me", verifyToken, authController.getMe);

// Password Recovery 
// ⚠️ CATATAN: Pastikan fungsi ini SUDAH ADA di authController.js
// Jika belum ada, COMMENT (matikan) dua baris di bawah ini agar tidak crash:
if (authController.forgotPassword) {
  router.post("/forgot-password", authController.forgotPassword);
}
if (authController.resetPassword) {
  router.post("/reset-password", authController.resetPassword);
}

// =========================================================
// 2. SOCIAL AUTH (Google OAuth)
// =========================================================

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth/success?token=${token}`);
  }
);

module.exports = router;