const express = require('express');
const { createCheckoutSession } = require('../controllers/paymentController');
const router = express.Router();

// User harus login dulu (Best practice: nanti tambahkan middleware auth di sini)
router.post('/create-checkout-session', createCheckoutSession);

module.exports = router;