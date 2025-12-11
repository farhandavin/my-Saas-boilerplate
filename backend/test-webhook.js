// Script untuk mengetes logika update database tanpa Stripe
// Jalankan dengan: node test-webhook.js


// 1. GANTI ID INI SESUAI ID USER DI DATABASE ANDA YANG MAU DITEST
const TARGET_USER_ID = "2"; 

const mockPayload = {
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_simulasi_lokal",
      object: "checkout.session",
      subscription: "sub_test_langganan_palsu_123",
      payment_status: "paid",
      status: "complete",
      metadata: {
        userId: TARGET_USER_ID // PENTING: Ini yang dibaca server
      }
    }
  }
};

async function runTest() {
  console.log("🚀 Mengirim data simulasi ke server...");

  try {
    const response = await fetch('http://localhost:5001/api/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPayload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("\n✅ RESPON SUKSES DARI SERVER:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log("\n❌ RESPON ERROR DARI SERVER:");
      console.log(data);
    }

  } catch (err) {
    console.error("\n❌ GAGAL KONEKSI:", err.message);
    console.log("👉 Pastikan server backend jalan (npm run dev) di terminal lain.");
  }
}

// Jalankan fungsi
runTest();