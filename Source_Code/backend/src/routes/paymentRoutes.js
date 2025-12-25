// src/routes/paymentRoutes.js

const express = require("express");

// 1. Import Controller
const { 
  createCheckoutSession, 
  createPortalSession, 
  cancelSubscription,   
  resumeSubscription 
} = require("../controllers/paymentController");

// 2. IMPORT MIDDLEWARE (Bagian ini yang sebelumnya hilang/error)
// Pastikan path "../middleware/authMiddleware" sesuai dengan struktur folder Anda
const verifyToken = require("../middleware/authMiddleware"); 

const router = express.Router();

// 3. Definisi Route dengan Middleware
router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.post("/create-portal-session", verifyToken, createPortalSession); 
router.post("/cancel-subscription", verifyToken, cancelSubscription);   
router.post("/resume-subscription", verifyToken, resumeSubscription);   

module.exports = router;