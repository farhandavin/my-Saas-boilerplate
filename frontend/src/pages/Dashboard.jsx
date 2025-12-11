import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State untuk menyimpan data user
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );

  // Fungsi Fetch Data User Terbaru
  const fetchLatestUserData = useCallback(async () => {
    if (user?.id) {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/auth/user/${user.id}`
        );
        const latestUser = res.data;

        // Update state dan localStorage
        setUser(latestUser);
        localStorage.setItem("user", JSON.stringify(latestUser));
      } catch (err) {
        console.error("Gagal update data user:", err);
      }
    }
  }, [user?.id]);

  // 1. Ambil data saat halaman dimuat
  useEffect(() => {
    fetchLatestUserData();
  }, [fetchLatestUserData]);

  // 2. Cek status pembayaran dari URL (setelah redirect Stripe)
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      alert("Pembayaran berhasil! Memproses status Pro Anda...");
      // Beri jeda agar webhook sempat update DB
      setTimeout(() => {
        fetchLatestUserData();
        navigate("/dashboard", { replace: true });
      }, 2500);
    }
  }, [searchParams, navigate, fetchLatestUserData]);

  // --- FUNGSI BARU: Handle Cancel & Resume ---
  const handleSubscriptionAction = async (action) => {
    const actionText =
      action === "cancel-subscription" ? "berhenti" : "melanjutkan";

    if (!confirm(`Apakah Anda yakin ingin ${actionText} langganan?`)) return;

    try {
      await axios.post(`http://localhost:5001/api/payment/${action}`, {
        userId: user.id,
      });

      alert(`Berhasil ${actionText} langganan!`);
      fetchLatestUserData(); // Refresh data agar tombol berubah
    } catch (err) {
      alert(
        "Gagal memproses permintaan: " +
          (err.response?.data?.error || err.message)
      );
    }
  };
  // -------------------------------------------

  const handleCheckout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/payment/create-checkout-session",
        { userId: user.id }
      );
      window.location.href = res.data.url;
    } catch (err) {
      alert("Gagal membuat sesi pembayaran");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isPro = user.plan === "pro";
  // Ambil status canceling dari user object (pastikan backend sudah kirim field ini)
  const isCanceling = user.cancelAtPeriodEnd;

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-gray-500 text-lg">Hello, {user?.name}</p>
              {isPro ? (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                  ⭐ PRO MEMBER
                </span>
              ) : (
                <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                  FREE MEMBER
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Pricing Card Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <div
            className={`p-8 rounded-2xl border transition-all ${
              !isPro
                ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                : "bg-white border-gray-200 opacity-60"
            }`}
          >
            <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
            <p className="text-4xl font-extrabold mt-4 text-gray-900">
              $0 <span className="text-lg font-normal text-gray-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-4 text-gray-600">
              <li className="flex items-center gap-2">✅ Basic Features</li>
              <li className="flex items-center gap-2">✅ Community Support</li>
            </ul>
            <button
              disabled
              className="mt-8 w-full py-3 bg-gray-100 text-gray-500 font-bold rounded-xl cursor-not-allowed"
            >
              {isPro ? "Downgrade" : "Current Plan"}
            </button>
          </div>

          {/* Pro Plan Card (Bagian yang paling banyak berubah) */}
          <div
            className={`relative p-8 rounded-2xl border transition-all ${
              isPro
                ? "bg-gray-900 text-white shadow-2xl scale-105 border-gray-800"
                : "bg-white border-gray-200 hover:shadow-lg"
            }`}
          >
            {!isPro && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                POPULAR
              </div>
            )}

            <h3
              className={`text-xl font-bold ${
                isPro ? "text-white" : "text-gray-800"
              }`}
            >
              Pro Plan
            </h3>
            <p
              className={`text-4xl font-extrabold mt-4 ${
                isPro ? "text-white" : "text-gray-900"
              }`}
            >
              $10{" "}
              <span
                className={`text-lg font-normal ${
                  isPro ? "text-gray-400" : "text-gray-500"
                }`}
              >
                /mo
              </span>
            </p>

            <ul
              className={`mt-6 space-y-4 ${
                isPro ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li className="flex items-center gap-2">🚀 All Features</li>
              <li className="flex items-center gap-2">💎 Priority Support</li>
              <li className="flex items-center gap-2">📊 Advanced Analytics</li>
            </ul>

            {/* LOGIKA TOMBOL PRO / CANCEL / RESUME */}
            {isPro ? (
              <div className="mt-8 space-y-3">
                <button
                  disabled
                  className="w-full py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg cursor-default flex justify-center items-center gap-2"
                >
                  ✅ Plan Aktif
                </button>

                {isCanceling ? (
                  <div className="text-center animate-pulse">
                    <p className="text-sm text-yellow-400 mb-2 font-medium">
                      ⚠️ Berakhir pada akhir periode tagihan.
                    </p>
                    <button
                      onClick={() =>
                        handleSubscriptionAction("resume-subscription")
                      }
                      className="text-sm text-blue-400 hover:text-blue-300 underline font-semibold transition-colors"
                    >
                      Lanjutkan Langganan (Resume)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      handleSubscriptionAction("cancel-subscription")
                    }
                    className="w-full text-sm text-red-400 hover:text-red-300 mt-2 hover:underline transition-colors"
                  >
                    Berhenti Langganan
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="mt-8 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
              >
                Upgrade to Pro ⚡
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
