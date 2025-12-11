const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

// Import Stripe & Prisma
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// Middleware CORS
app.use(cors());

// --- BAGIAN WEBHOOK (Wajib sebelum express.json) ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata.userId);
    console.log(`💰 Payment success for User ID: ${userId}`);

    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'pro' }
    });
  }

  res.json({ received: true });
});
// ----------------------------------------------------

// Middleware JSON (Supaya bisa baca body request biasa)
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// --- PERBAIKAN: Route Default / ---
// Ini yang hilang tadi, makanya error "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Backend SaaS Starter Kit is Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));