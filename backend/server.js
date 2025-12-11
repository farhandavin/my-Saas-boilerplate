// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const { PrismaClient } = require("@prisma/client");

// Import Routes
const paymentRoutes = require("./src/routes/paymentRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = 5001; // Sesuai permintaan (Port 5001)

// ==================================================================
// 1. ROUTE WEBHOOK (WAJIB PALING ATAS & RAW BODY)
// ==================================================================
// Stripe butuh body mentah untuk validasi signature
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`⚠️ [WEBHOOK FAIL] Signature Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle Event
    try {
      switch (event.type) {
        // 1. Saat user pertama kali bayar sukses
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = parseInt(session.metadata?.userId);

          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                plan: "pro",
                stripeSubscriptionId: session.subscription,
                cancelAtPeriodEnd: false,
              },
            });
            console.log(`✅ [SUKSES] User ID ${userId} sekarang PRO.`);
          }
          break;
        }

        // 2. Saat pembayaran perpanjangan sukses (bulanan/tahunan)
        case "invoice.paid": {
          const invoice = event.data.object;
          console.log(
            `💰 [INVOICE] Pembayaran sukses untuk subscription: ${invoice.subscription}`
          );
          // Di sini Anda bisa memperpanjang durasi di DB jika ada kolom expiredAt
          break;
        }

        // 3. Saat pembayaran gagal (kartu mati/limit habis)
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;

          // Cari user berdasarkan subscriptionId dan kembalikan ke free
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { plan: "free" }, // Downgrade user karena gagal bayar
            });
            console.log(
              `❌ [GAGAL] Downgrade user ${user.email} ke FREE karena pembayaran gagal.`
            );
          }
          break;
        }

        // 4. Saat user mengubah plan atau cancel via Customer Portal
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          // Cek apakah user menjadwalkan pembatalan (cancel_at_period_end)
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                // Jika status subscription bukan 'active', mungkin expired
                plan: subscription.status === "active" ? "pro" : "free",
              },
            });
            console.log(
              `🔄 [UPDATE] Subscription update untuk ${user.email}. Cancel at end: ${subscription.cancel_at_period_end}`
            );
          }
          break;
        }

        // 5. Saat subscription benar-benar dihapus (selesai masa aktif setelah cancel)
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                plan: "free",
                stripeSubscriptionId: null,
                cancelAtPeriodEnd: false,
              },
            });
            console.log(
              `💀 [DELETED] Langganan User ${user.email} telah berakhir.`
            );
          }
          break;
        }

        default:
          console.log(`🔔 [INFO] Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.error("❌ [DB ERROR] Gagal memproses webhook:", error.message);
      // Jangan return error status 500 ke Stripe agar tidak retry terus menerus jika error logic DB
    }

    res.json({ received: true });
  }
);

// app.post('/api/test-webhook', express.json(), async (req, res) => {
//   const event = req.body; // Terima JSON mentah langsung dari kita

//   console.log(`\n🧪 [TEST MODE] Menerima Event Simulasi: ${event.type}`);

//   try {
//     // Logika yang SAMA PERSIS dengan Webhook Asli
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
//       const userId = parseInt(session.metadata?.userId); 

//       console.log(`🔍 [TEST-CHECKOUT] Memproses User ID: ${userId}`);

//       if (userId) {
//         // Update User jadi PRO
//         const updatedUser = await prisma.user.update({
//           where: { id: userId },
//           data: { 
//             plan: 'pro',
//             stripeSubscriptionId: session.subscription || "sub_test_dummy_123", 
//             cancelAtPeriodEnd: false
//           }
//         });
//         console.log(`✅ [TEST-SUKSES] Database Updated: User ${updatedUser.email} sekarang PRO.`);
//         return res.json({ success: true, message: `User ${updatedUser.email} jadi PRO`, user: updatedUser });
//       } else {
//         console.warn("⚠️ [TEST-SKIP] Tidak ada userId di metadata.");
//         return res.status(400).json({ error: "No userId in metadata" });
//       }
//     } else {
//       console.log("ℹ️ [TEST-INFO] Event tipe lain, tidak diproses.");
//     }

//     res.json({ received: true });
//   } catch (error) {
//     console.error("❌ [TEST-ERROR] Gagal:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// ==================================================================
// 2. MIDDLEWARE UMUM (SETELAH WEBHOOK)
// ==================================================================
app.use(cors());
app.use(express.json()); // Parsing JSON untuk route selain webhook

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log(`👉 Webhook URL: http://localhost:${PORT}/api/webhook`);
});
