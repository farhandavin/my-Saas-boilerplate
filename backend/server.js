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
    // Verifikasi tanda tangan Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    // Jika tanda tangan gagal, log error dan beri tahu Stripe (400 Bad Request)
    console.error(`❌ Webhook Error: Signature verification failed. ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Tangani event yang relevan
  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.created') {
    const dataObject = event.data.object;
    
    // Ambil userId dari metadata (yang dikirim dari paymentController.js)
    const rawUserId = dataObject.metadata?.userId;
    const userId = parseInt(rawUserId, 10);
    
    console.log(`[Stripe Webhook] Event Type: ${event.type}. User ID: ${userId}`);

    // Pastikan userId valid
    if (userId && !isNaN(userId)) {
      try {
        // PERBAIKAN: Masukkan operasi database ke dalam try...catch
        await prisma.user.update({
          where: { id: userId },
          data: { plan: 'pro' }
        });
        console.log(`✅ Database updated for User ID: ${userId}. Plan set to 'pro'`);
      } catch (dbError) {
        // Jika update database gagal, log error spesifik dan kembalikan status 500
        console.error(`❌ DB Update FAILED for User ID ${userId} on event ${event.type}:`, dbError.message);
        // Mengembalikan 500 akan meminta Stripe untuk mencoba mengirim event ini lagi (retry)
        return res.status(500).send(`Database Error on update: ${dbError.message}`); 
      }
    } else {
      console.error(`❌ Invalid or missing User ID in metadata: ${rawUserId}`);
    }
  }
  
  // Event yang berhasil diverifikasi dan diproses (atau diabaikan karena tidak relevan) harus mengembalikan 200 OK
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