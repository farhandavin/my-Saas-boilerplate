// src/routes/webhookRoutes.js
const express = require("express");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

/**
 * ------------------------------------------------------------------
 * STRIPE WEBHOOK ROUTE
 * Endpoint: POST /api/webhooks/stripe (Asumsi dimount di /api/webhooks)
 * ------------------------------------------------------------------
 * * CATATAN PENTING KONFIGURASI SERVER.JS:
 * 1. Route ini TIDAK BOLEH menggunakan middleware otentikasi (AuthMiddleware).
 * Stripe tidak memiliki token JWT user Anda. Keamanan dijamin via Signature.
 * * 2. Route ini HARUS menerima RAW BODY (Buffer), bukan JSON yang sudah diparsing.
 * Pastikan di server.js/app.js, route ini didefinisikan SEBELUM 'express.json()'.
 * * Contoh urutan di server.js:
 * app.use('/api/webhooks', webhookRoutes); // <-- Webhook duluan (Raw)
 * app.use(express.json());                 // <-- Baru parser global
 * app.use('/api', otherRoutes);
 */

router.post(
  "/stripe",
  // Gunakan express.raw spesifik di sini untuk memaksa buffer (Opsional, tapi aman)
  // Pastikan type-nya cocok dengan header yang dikirim Stripe ('application/json')
  express.raw({ type: 'application/json' }), 
  webhookController.handleStripeWebhook
);

module.exports = router;