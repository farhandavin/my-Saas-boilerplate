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

// --- WEBHOOK HANDLER (Logika Update Database) ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Event Checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Log Apa Adanya dari Stripe (Debugging)
    console.log("🔔 Event Checkout Masuk! Mengecek Metadata...");
    console.log("📦 ISI METADATA:", JSON.stringify(session.metadata, null, 2));

    const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : null;

    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: 'pro' }
        });
        console.log(`🎉 SUKSES BESAR: User ID ${userId} berhasil diubah jadi PRO di Database!`);
      } catch (dbError) {
        console.error(`❌ Gagal Update DB: ${dbError.message}`);
      }
    } else {
      console.error("⚠️ Metadata userId KOSONG. Pastikan Anda checkout menggunakan link BARU, bukan link lama.");
    }
  }

  res.json({ received: true });
});

// Middleware & Routes Biasa
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server Backend Berjalan di Port ${PORT}`));