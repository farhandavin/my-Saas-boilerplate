// backend/src/routes/authRoutes.js
const express = require("express");
const { register, login, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware"); // Import middleware

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// GANTI route getUser lama dengan ini:
router.get("/me", verifyToken, getMe); // <-- AMAN: Pakai token

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;