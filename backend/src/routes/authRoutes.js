// backend/src/routes/authRoutes.js
const express = require("express");
const passport = require("../config/passport"); // Import config passport
const jwt = require("jsonwebtoken");
const { register, login, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe); // <-- AMAN: Pakai token

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. Callback dari Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    // Login Sukses -> Generate Token
    const user = req.user;
    
    // BACA JWT_SECRET DI SINI (Local Scope) AGAR LEBIH AMAN
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET, // Gunakan process.env langsung
      { expiresIn: "1d" }
    );

    const frontendURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${frontendURL}/auth?token=${token}`);
  }
);

module.exports = router;