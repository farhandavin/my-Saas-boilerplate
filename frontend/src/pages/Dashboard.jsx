import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem('user'));

  // Cek apakah user baru balik dari Stripe (Success)
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      alert('Pembayaran Berhasil! Akun Anda kini PRO.');
      // Idealnya di sini kita fetch ulang data user terbaru dari backend
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/payment/create-checkout-session', {
        userId: user.id
      });
      // Redirect user ke halaman Stripe
      window.location.href = res.data.url;
    } catch (err) {
      alert('Gagal membuat sesi pembayaran');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium">
            Sign Out
          </button>
        </div>

        {/* Pricing Card Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
            <p className="text-3xl font-bold mt-2">$0 <span className="text-sm text-gray-500">/mo</span></p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✅ Basic Features</li>
              <li>✅ Community Support</li>
            </ul>
            <button disabled className="mt-6 w-full py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1">POPULAR</div>
            <h3 className="text-xl font-bold text-gray-800">Pro Plan</h3>
            <p className="text-3xl font-bold mt-2">$10 <span className="text-sm text-gray-500">/mo</span></p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>✅ All Features</li>
              <li>✅ Priority Support</li>
              <li>✅ Analytics</li>
            </ul>
            <button 
              onClick={handleCheckout}
              className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
            >
              Upgrade to Pro 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}