const express = require("express");
const { 
  createCheckoutSession, 
  cancelSubscription, 
  resumeSubscription,
  createPortalSession // <-- Added this
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/cancel-subscription", cancelSubscription); // New Route
router.post("/resume-subscription", resumeSubscription); // New Route
router.post("/create-portal-session", createPortalSession);

module.exports = router;