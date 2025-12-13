// src/pages/Dashboard.jsx
// Di bagian paling atas file src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Tambahkan 'Sun', 'Moon' di import icon
import {
  LogOut,
  Home,
  User,
  Settings,
  CreditCard,
  CheckCircle,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
// Tambahkan import useTheme
import useTheme from "../hooks/useTheme";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const { theme, toggleTheme } = useTheme();
  // Simulasi Load Data User
  useEffect(() => {
    const fetchLatestUserData = async () => {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token) {
        navigate("/auth");
        return;
      }

      // 1. Tampilkan data lama dulu biar cepat (Optimistic UI)
      if (storedUser && storedUser.id) {
        setUser({
          ...storedUser,
          plan: storedUser.plan || "Free",
          subscriptionStatus: storedUser.subscriptionStatus || "active",
        });
      }

      // 2. Ambil data TERBARU dari Database (Background Refresh)
      try {
        // Asumsi Anda punya endpoint untuk get profile (misal: /api/auth/me atau get user by id)
        // Jika belum ada endpoint '/me', kita pakai endpoint user details biasa.
        const response = await fetch(`http://localhost:5001/api/auth/me`, {
          // Pastikan endpoint ini ada
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const freshUserData = await response.json();

          // 3. Update State & LocalStorage dengan data baru (Team/Pro)
          setUser(freshUserData);
          localStorage.setItem("user", JSON.stringify(freshUserData));
          console.log("Data user diperbarui:", freshUserData.plan);
        }
      } catch (err) {
        console.error("Gagal refresh data user:", err);
      }
    };

    fetchLatestUserData();
  }, [navigate]);

  const PLAN_PRICES = {
    Pro: "price_1SdYbxJw6lwIO889e72HIAYe", // Ganti dengan ID Price Pro Anda
    Team: "price_1SdYbeJw6lwIO889QIkgdwqB", // Ganti dengan ID Price Team Anda
  };
  // --- FITUR SUBSCRIPTION ---

  const handleUpgrade = async (planName) => {
    setLoadingAction(true);

    try {
      // Ambil Price ID yang sesuai
      const priceId = PLAN_PRICES[planName];
      if (!priceId) {
        alert("Paket belum tersedia.");
        setLoadingAction(false);
        return;
      }

      // Panggil Backend
      const response = await fetch(
        "http://localhost:5001/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment jika butuh token
          },
          body: JSON.stringify({
            userId: user.id, // Pastikan user.id ada!
            priceId: priceId, // Kirim ID harga ke backend
          }),
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Gagal inisiasi pembayaran");

      // Redirect ke halaman Stripe
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert(`Gagal: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelSubscription = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin berhenti berlangganan? Anda akan kehilangan akses fitur Premium di periode berikutnya."
      )
    ) {
      setLoadingAction(true);
      setTimeout(() => {
        const updatedUser = { ...user, subscriptionStatus: "canceled" };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setLoadingAction(false);
      }, 1000);
    }
  };

  const handleResumeSubscription = () => {
    setLoadingAction(true);
    setTimeout(() => {
      const updatedUser = { ...user, subscriptionStatus: "active" };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setLoadingAction(false);
      alert("Langganan berhasil diperpanjang!");
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600">
        <Loader2 className="animate-spin" />
      </div>
    );

  const isPremium = user.plan !== "Free";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-poppins transition-colors duration-300">
      {/* 2. Sidebar: dark:bg-slate-900 dark:border-slate-800 */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 hidden md:flex flex-col p-6 fixed h-full z-10 transition-colors duration-300">
        <div className="text-2xl font-bold text-blue-700 mb-10 tracking-tight">
          SaaS<span className="text-slate-800 dark:text-white">Board</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<Home size={20} />} label="Overview" active />
          <NavItem icon={<CreditCard size={20} />} label="Billing" />
          <NavItem icon={<User size={20} />} label="Team" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors w-full px-3 py-2 rounded-lg text-sm font-medium"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              Dashboard
              {/* ... (bagian Badge Member tetap sama) ... */}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {user.name}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* --- TOMBOL DARK MODE --- */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* ------------------------ */}

            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* StatCard akan otomatis berubah jika Helper Component di bawah diupdate */}
          <StatCard title="Total Revenue" value="$12,450" change="+12%" />
          <StatCard title="Active Users" value="1,240" change="+5%" />
          
          {/* KARTU CURRENT PLAN (Ini yang masih putih di gambar Anda) */}
          {/* Tambahkan: dark:bg-slate-900 dark:border-slate-800 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-300">
             <div className="relative z-10">
                <p className="text-sm text-slate-400 font-medium mb-1">Current Plan</p>
                <div className="flex items-end justify-between">
                  {/* Tambahkan: dark:text-white */}
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{user.plan}</h3>
                  
                  {/* LOGIKA TOMBOL (Tetap sama, pastikan class stylenya aman) */}
                  {isPremium ? (
                    user.subscriptionStatus === 'active' ? (
                      <button 
                        onClick={handleCancelSubscription}
                        disabled={loadingAction}
                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
                      >
                        {loadingAction ? 'Processing...' : 'Cancel Subs'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleResumeSubscription}
                        disabled={loadingAction}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1 rounded-md transition-colors"
                      >
                        {loadingAction ? 'Processing...' : 'Resume Subs'}
                      </button>
                    )
                  ) : (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-md">Free Forever</span>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* PRICING SECTION (Sesuai Request) */}
        <section className="py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm px-4 md:px-8 transition-colors duration-300">
  <div className="max-w-4xl mx-auto text-center mb-12">
    <span className="font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Pricing Plans</span>
    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-4">Choose your best plan</h2>
    <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">Upgrade to unlock full potential. Switch plans or cancel anytime.</p>
  </div>
  
  <div className="flex flex-wrap items-stretch -mx-4 justify-center">
    
    {/* PLAN 1: BEGINNER (Free) */}
    <div className="flex w-full mb-8 md:w-1/2 lg:w-1/3 px-4">
      <div className={`flex flex-grow flex-col p-6 space-y-6 rounded-2xl border transition-all duration-300 ${
        user.plan === 'Free' 
        // JIKA AKTIF (Free): Background putih di light, slate-800 di dark
        ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-xl scale-105 bg-white dark:bg-slate-800' 
        // JIKA TIDAK AKTIF: Background slate-50 di light, slate-800/50 di dark
        : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-200 dark:hover:border-slate-600'
      }`}>
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300">Beginner</h4>
          <span className="text-5xl font-bold text-slate-800 dark:text-white">Free</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Perfect for getting started with essential features.</p>
        <ul className="flex-1 space-y-3 text-slate-600 dark:text-slate-300 text-sm mb-6">
          <ListItem text="Basic Analytics" />
          <ListItem text="Up to 5 Projects" />
          <ListItem text="Community Support" />
        </ul>
        <button 
          type="button" 
          disabled={user.plan === 'Free'}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
            user.plan === 'Free' 
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-default' 
            : 'bg-white dark:bg-transparent border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-600 hover:text-blue-600'
          }`}
        >
          {user.plan === 'Free' ? 'Current Plan' : 'Downgrade'}
        </button>
      </div>
    </div>

    {/* PLAN 2: PRO (Premium) */}
    <div className="flex w-full mb-8 md:w-1/2 lg:w-1/3 px-4">
      {/* Tambahkan dark:bg-slate-800 dan dark:border-slate-700 */}
      <div className={`flex flex-grow flex-col p-6 space-y-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        user.plan === 'Pro' 
        ? 'border-blue-600 ring-4 ring-blue-600/20 shadow-2xl bg-white dark:bg-slate-800 scale-105 z-10' 
        : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:shadow-lg'
      }`}>
        {user.plan === 'Pro' && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">ACTIVE</div>}
        
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-blue-900 dark:text-blue-400">Pro</h4>
          <span className="text-5xl font-bold text-slate-900 dark:text-white">$24<span className="text-sm text-slate-400 font-medium tracking-wide">/mo</span></span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">For growing businesses that need more power.</p>
        <ul className="flex-1 space-y-3 text-slate-600 dark:text-slate-300 text-sm mb-6">
          <ListItem text="Everything in Free" active />
          <ListItem text="Unlimited Projects" active />
          <ListItem text="Priority Support" active />
          <ListItem text="Advanced Analytics" active />
        </ul>
        <button 
          onClick={() => handleUpgrade('Pro')}
          disabled={user.plan === 'Pro' || loadingAction}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 ${
            user.plan === 'Pro'
            ? 'bg-blue-600 text-white cursor-default shadow-none hover:translate-y-0'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
            {loadingAction ? 'Processing...' : (user.plan === 'Pro' ? 'Current Plan' : 'Get Started')}
        </button>
      </div>
    </div>

    {/* PLAN 3: TEAM */}
    <div className="flex w-full mb-8 md:w-1/2 lg:w-1/3 px-4">
      <div className={`flex flex-grow flex-col p-6 space-y-6 rounded-2xl border transition-all duration-300 ${
        user.plan === 'Team' 
        ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-xl scale-105 bg-white dark:bg-slate-800' 
        : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-200 dark:hover:border-slate-600'
      }`}>
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300">Team</h4>
          <span className="text-5xl font-bold text-slate-800 dark:text-white">$72<span className="text-sm text-slate-400 font-medium tracking-wide">/mo</span></span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Best for dedicated teams and large scale ops.</p>
        <ul className="flex-1 space-y-3 text-slate-600 dark:text-slate-300 text-sm mb-6">
          <ListItem text="Everything in Pro" />
          <ListItem text="Dedicated Account Manager" />
          <ListItem text="SSO Integration" />
          <ListItem text="Audit Logs" />
          <ListItem text="99.9% SLA" />
        </ul>
        <button 
          onClick={() => handleUpgrade('Team')}
          disabled={user.plan === 'Team' || loadingAction}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
             user.plan === 'Team'
             ? 'bg-blue-600 text-white'
             : 'bg-white dark:bg-transparent border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-600 hover:text-blue-600'
          }`}
        >
          {user.plan === 'Team' ? 'Current Plan' : 'Get Started'}
        </button>
      </div>
    </div>

  </div>
</section>
      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const NavItem = ({ icon, label, active }) => (
  // Tambahkan dark:text-slate-400 dark:hover:bg-slate-800
  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
    active 
    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
  }`}>
    {icon} {label}
  </button>
);

const StatCard = ({ title, value, change }) => (
  // Tambahkan dark:bg-slate-900 dark:border-slate-800
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
    <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
    <div className="flex items-end justify-between">
      {/* Tambahkan dark:text-white */}
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
      {change && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">{change}</span>}
    </div>
  </div>
);

const ListItem = ({ text, active = false }) => (
  <li className="flex items-start space-x-3">
    <CheckCircle size={18} className={`flex-shrink-0 mt-0.5 ${active ? 'text-blue-500' : 'text-blue-300 dark:text-slate-600'}`} />
    <span>{text}</span>
  </li>
);

export default Dashboard;