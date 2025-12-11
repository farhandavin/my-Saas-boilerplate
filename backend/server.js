const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./src/routes/authRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());

// ==================================================================
//  🕵️‍♂️ WEBHOOK DETECTIVE (Logging Super Lengkap)
// ==================================================================
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ [WH-ERROR] ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 1. KASUS: USER BARU SAJA BAYAR (CHECKOUT SUKSES)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata?.userId);

    if (userId) {
      console.log(`💰 [WH] Checkout sukses untuk User ID: ${userId}`);
      
      // Simpan Subscription ID ke Database
      await prisma.user.update({
        where: { id: userId },
        data: { 
          plan: 'pro',
          stripeSubscriptionId: session.subscription, // Simpan ID ini!
          cancelAtPeriodEnd: false
        }
      });
    }
  }

  // 2. KASUS: ADA PERUBAHAN LANGGANAN (CANCEL / RESUME)
  // Stripe mengirim event ini saat kita request cancel/resume via API
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    
    // Cari user berdasarkan subscription ID
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (user) {
      console.log(`cx [WH] Subscription Updated untuk ${user.email}`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // Update status apakah akan berhenti di akhir periode
          cancelAtPeriodEnd: subscription.cancel_at_period_end 
        }
      });
    }
  }

  // 3. KASUS: LANGGANAN BENAR-BENAR MATI (SUDAH LEWAT MASA AKTIF)
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
     const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (user) {
      console.log(`zz [WH] Subscription EXPIRED untuk ${user.email}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          plan: 'free',
          stripeSubscriptionId: null,
          cancelAtPeriodEnd: false
        }
      });
    }
  }

  res.json({ received: true });
});
// ==================================================================

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`💻 Server Siap di Port ${PORT}. Menunggu aktivitas...`));