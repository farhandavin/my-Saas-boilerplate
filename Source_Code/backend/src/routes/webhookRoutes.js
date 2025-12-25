// src/routes/webhookRoutes.js
const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

// Definisi route untuk webhook
// Karena di server.js sudah didefinisikan path '/api/webhook', di sini cukup '/'
router.post("/", webhookController.handleStripeWebhook);

module.exports = router;