// src/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

// 1. Import Controller
// Pastikan nama fungsi di sini SAMA PERSIS dengan exports di paymentController.js
const { 
  createCheckoutSession, 
  createPortalSession, 
  cancelSubscription, 
  resumeSubscription 
} = require("../controllers/paymentController");

// 2. Import Middleware
// Karena authMiddleware.js menggunakan "module.exports = ...", kita import TANPA kurung kurawal {}
const verifyToken = require("../middleware/authMiddleware"); 

// Debugging: Pastikan verifyToken adalah fungsi
// console.log("Middleware Check:", typeof verifyToken); // Harus output: 'function'

// 3. Definisi Route
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post("/create-portal-session", verifyToken, createPortalSession); 
router.post("/cancel-subscription", verifyToken, cancelSubscription);   
router.post("/resume-subscription", verifyToken, resumeSubscription);   

module.exports = router;