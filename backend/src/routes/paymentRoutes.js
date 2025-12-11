const express = require("express");
const {
  createCheckoutSession,
  cancelSubscription,
  resumeSubscription,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/cancel-subscription", cancelSubscription); // Route Baru
router.post("/resume-subscription", resumeSubscription); // Route Baru

module.exports = router;
