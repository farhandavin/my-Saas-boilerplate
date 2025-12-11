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

  console.log('\n🔔 [WH-1] Sinyal Webhook diterima dari Stripe...');
  console.log('👀 [DEBUG] Panjang Body:', req.body.length);
  console.log('🔑 [DEBUG] Webhook Secret di Server:', process.env.STRIPE_WEBHOOK_SECRET); 
  // (Pastikan outputnya 'whsec_...' dan bukan undefined)
  // -------------------------

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('🔐 [WH-2] Tanda tangan (Signature) Valid. Ini asli dari Stripe.');
  } catch (err) {
    console.error(`❌ [WH-ERROR] Tanda tangan palsu atau salah config! Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Cek Tipe Event
  if (event.type === 'checkout.session.completed') {
    console.log('📦 [WH-3] Event terdeteksi: checkout.session.completed');
    
    const session = event.data.object;
    
    // LOG ISI METADATA (Bagian paling krusial)
    console.log('🧐 [WH-4] Memeriksa Metadata titipan...');
    console.log('   >>> ISI METADATA:', JSON.stringify(session.metadata, null, 2));

    const userIdString = session.metadata?.userId;

    if (userIdString) {
      const userId = parseInt(userIdString, 10);
      console.log(`🔄 [WH-5] Metadata OK (ID: ${userId}). Mencoba update database...`);

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { plan: 'pro' }
        });

        console.log(`🎉 [WH-6] SUKSES BESAR!`);
        console.log(`   >>> User: ${updatedUser.email}`);
        console.log(`   >>> Plan Baru: ${updatedUser.plan}`);
        console.log(`   >>> Waktu Update: ${new Date().toLocaleTimeString()}`);
        
      } catch (dbError) {
        console.error(`❌ [WH-DB-ERROR] Gagal update database: ${dbError.message}`);
      }
    } else {
      console.error("⚠️ [WH-FAIL] Metadata 'userId' KOSONG! Pastikan checkout dibuat dengan kode terbaru.");
    }
  } else {
    // Event lain (misal: payment_intent.created) tidak perlu dilog detail
    // console.log(`ℹ️ [WH-IGNORE] Mengabaikan event: ${event.type}`);
  }

  res.json({ received: true });
});
// ==================================================================

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`💻 Server Siap di Port ${PORT}. Menunggu aktivitas...`));