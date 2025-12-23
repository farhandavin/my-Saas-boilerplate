// 1. IMPORT (Selalu paling atas)
const express = require("express");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const { register, login, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// 2. INISIALISASI ROUTER
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// =========================================================
// 3. DEFINISI ROUTE & DOKUMENTASI
// =========================================================


router.post("/register", register);


router.post("/login", login); // <-- PERHATIKAN: Komentar di atas menempel ke baris ini


router.get("/me", verifyToken, getMe);

// --- Route Lupa Password (Bisa ditambahkan dokumentasinya nanti) ---
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// --- Google OAuth Routes (Biasanya tidak butuh Swagger karena redirect browser) ---
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
      { id: user.id }, 
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const frontendURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${frontendURL}/auth?token=${token}`);
  }
);

module.exports = router;