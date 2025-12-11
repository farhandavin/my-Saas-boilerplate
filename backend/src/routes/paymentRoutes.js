const express = require("express");
const { 
  createCheckoutSession, 
  cancelSubscription, 
  resumeSubscription,
  createPortalSession // <-- Tambah ini
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/cancel-subscription", cancelSubscription); // Route Baru
router.post("/resume-subscription", resumeSubscription); // Route Baru
router.post("/create-portal-session", createPortalSession);
module.exports = router;
