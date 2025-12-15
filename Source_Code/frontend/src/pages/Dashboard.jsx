// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Sparkles,
  Users,
  Bot,
  Plus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import useTheme from "../hooks/useTheme";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // --- STATE UTAMA ---
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingUser, setLoadingUser] = useState(true);

  // --- STATE KHUSUS FITUR ---
  const [teams, setTeams] = useState([]);

  // State Aksi (Loading Buttons)
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // State Input
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // --- 1. INITIAL DATA FETCHING ---
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      try {
        setLoadingUser(true);
        // A. Fetch User Data
        const userRes = await fetch(`${api_url}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();

        // B. Fetch Teams Data
        const teamRes = await fetch(`${api_url}/api/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teamData = teamRes.ok ? await teamRes.json() : [];

        // Set State
        setUser(userData);
        setTeams(teamData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/auth");
      } finally {
        setLoadingUser(false);
      }
    };

    initData();
  }, [navigate]);

  // --- 2. BILLING HANDLERS (LOGIC ASLI) ---
  const PLAN_PRICES = {
    Pro: "price_1SdYbxJw6lwIO889e72HIAYe",//change with your price
    Team: "price_1SdYbeJw6lwIO889QIkgdwqB",//change with your price
  };

  const handleUpgrade = async (planName) => {
    setLoadingBilling(true); // <--- GANTI INI
    try {
      const priceId = PLAN_PRICES[planName];
      if (!priceId) {
        alert("Paket belum tersedia.");
        return;
      }

      const response = await fetch(
        `${api_url}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user.id, priceId }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal inisiasi pembayaran");

      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setLoadingBilling(false); // <--- GANTI INI
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin membatalkan langganan? Akses Premium akan tetap aktif hingga akhir periode."
      )
    )
      return;

    setLoadingBilling(true); // <--- GANTI INI
    try {
      const response = await fetch(
        `${api_url}/api/payment/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) throw new Error("Gagal membatalkan langganan");

      setUser((prev) => ({
        ...prev,
        cancelAtPeriodEnd: true,
        subscriptionStatus: "canceled",
      }));
      alert("Langganan berhasil dibatalkan.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingBilling(false); // <--- GANTI INI
    }
  };

  const handleResumeSubscription = async () => {
    setLoadingBilling(true); // <--- GANTI INI
    try {
      const response = await fetch(
        `${api_url}/api/payment/resume-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) throw new Error("Gagal melanjutkan langganan");

      setUser((prev) => ({
        ...prev,
        cancelAtPeriodEnd: false,
        subscriptionStatus: "active",
      }));
      alert("Langganan berhasil diaktifkan kembali!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingBilling(false); // <--- GANTI INI
    }
  };

  // --- 3. TEAM HANDLER ---
  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    setLoadingTeam(true);
    try {
      const res = await fetch(`${api_url}/api/teams/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update list team secara real-time
        setTeams([...teams, { ...data.team, role: "owner" }]);
        setShowCreateTeamModal(false);
        setNewTeamName("");
      } else {
        alert("Gagal membuat tim.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoadingTeam(false);
    }
  };

  // --- 4. AI HANDLER ---
  const handleGenerateAI = async () => {
    if (!prompt) return;
    setLoadingAi(true);
    setAiResponse("");
    try {
      const res = await fetch(`${api_url}/api/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) setAiResponse(data.result);
      else alert(data.error || "Gagal.");
    } catch (error) {
      alert("Error koneksi AI.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  if (loadingUser || !user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );

  const isPremium = user.plan !== "Free" && user.plan !== "free"; // Handle case sensitive
  const isActive =
    user.subscriptionStatus === "active" && !user.cancelAtPeriodEnd;

  // --- CONTENT RENDERER ---
  const renderContent = () => {
    switch (activeTab) {
      // --- TAB 1: OVERVIEW (MENAMPILKAN SEMUA INFO PENTING) ---
      case "overview":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* GRID SUMMARY UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Billing Status */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <CreditCard size={20} />
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isActive ? "Active" : "Basic"}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Current Plan
                </p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 capitalize">
                  {user.plan}
                </h3>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="text-sm text-blue-600 mt-4 font-medium hover:underline flex items-center gap-1"
                >
                  Manage Subscription <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 2: Team Status */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {teams.length} Teams
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Collaborations
                </p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {teams.length > 0
                    ? `${teams.length} Active Groups`
                    : "No Teams Yet"}
                </h3>
                <button
                  onClick={() => setActiveTab("team")}
                  className="text-sm text-purple-600 mt-4 font-medium hover:underline flex items-center gap-1"
                >
                  View Teams <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 3: AI Quick Access */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg text-white">
                    <Sparkles size={20} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Generate Content
                </h3>
                <p className="text-indigo-100 text-sm mt-1 leading-relaxed">
                  Need ideas? Use our AI to write instantly.
                </p>
                <button
                  onClick={() => setActiveTab("ai")}
                  className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors"
                >
                  Open AI Tools
                </button>
              </div>
            </div>

            {/* Quick Activity Table (Mockup) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Recent Activity
              </h4>
              <div className="space-y-4">
                {teams.length > 0 ? (
                  teams.slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-600 dark:text-slate-300">
                        You joined team <strong>{t.name}</strong> as{" "}
                        <span className="capitalize">{t.role}</span>.
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    No recent activity found.
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  AI Content Generator
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Unlimited generation for Pro members.
                </p>
              </div>

              <textarea
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 dark:text-slate-200 transition-all resize-none min-h-[150px]"
                placeholder="What do you want to create today? (e.g. A polite email to reject a job offer)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleGenerateAI}
                  disabled={loadingAi || !prompt}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  {loadingAi ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Bot size={20} />
                  )}
                  {loadingAi ? "Thinking..." : "Generate Content"}
                </button>
              </div>

              {aiResponse && (
                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Result
                  </p>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "team":
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Team Management
              </h2>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all"
              >
                <Plus size={18} /> New Team
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {teams.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Users size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    No teams yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Create a team to organize your projects.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {team.name}
                          </h4>
                          <span className="text-xs text-slate-500 capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {team.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                        Active Member
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                Subscription Plans
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Pilih paket yang sesuai dengan kebutuhan tim Anda.
              </p>
            </div>

            {/* GRID HARGA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <PricingCard
                name="Free"
                price="$0"
                userPlan={user?.plan || "Free"}
                features={[
                  "Basic Analytics",
                  "3 AI Credits/day",
                  "1 Team Member",
                ]}
              />
              <PricingCard
                name="Pro"
                price="$24"
                userPlan={user?.plan || "Free"}
                isPopular
                features={[
                  "Unlimited AI",
                  "Priority Support",
                  "5 Team Members",
                ]}
                onUpgrade={() => handleUpgrade("Pro")}
                loading={loadingBilling} // <--- GANTI INI (DULU loadingAction)
              />
              <PricingCard
                name="Team"
                price="$72"
                userPlan={user?.plan || "Free"}
                features={[
                  "Unlimited Everything",
                  "SSO Integration",
                  "Unlimited Teams",
                ]}
                onUpgrade={() => handleUpgrade("Team")}
                loading={loadingBilling} // <--- GANTI INI (DULU loadingAction)
              />
            </div>

            {/* AREA MANAJEMEN LANGGANAN */}
            {isPremium && (
              <div className="max-w-3xl mx-auto mt-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      user.cancelAtPeriodEnd
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">
                      Status Langganan
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.cancelAtPeriodEnd
                        ? "Langganan akan berakhir pada akhir periode ini."
                        : "Langganan Anda aktif (Auto-renew)."}
                    </p>
                  </div>
                </div>

                {/* Tombol Berubah Sesuai Status */}
                {user.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleResumeSubscription}
                    disabled={loadingBilling} // <--- GANTI INI
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-all shadow-md"
                  >
                    {loadingBilling ? "Memproses..." : "Lanjutkan Langganan"}
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loadingBilling} // <--- GANTI INI
                    className="px-5 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-all"
                  >
                    {loadingBilling ? "Memproses..." : "Batalkan Langganan"}
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="max-w-2xl mx-auto text-center py-20 text-slate-400 animate-in fade-in zoom-in duration-300">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">
              Settings Coming Soon
            </h3>
            <p>Profile and notification preferences will be here.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-poppins transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 hidden md:flex flex-col p-6 fixed h-full z-10">
        <div className="text-2xl font-bold text-blue-700 mb-10 tracking-tight">
          SaaS<span className="text-slate-800 dark:text-white">Board</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<Home size={20} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavItem
            icon={<Sparkles size={20} />}
            label="AI Tools"
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Team"
            active={activeTab === "team"}
            onClick={() => setActiveTab("team")}
          />
          <NavItem
            icon={<CreditCard size={20} />}
            label="Billing"
            active={activeTab === "billing"}
            onClick={() => setActiveTab("billing")}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-500 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8 relative">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
              {activeTab}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 dark:text-slate-400">
                Welcome,{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {user.name}
                </span>
              </p>
              {/* STATUS PLAN BADGE */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                  isPremium
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {user.plan} Plan
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-all"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {renderContent()}

        {/* MODAL CREATE TEAM */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Create Team
              </h3>
              <input
                type="text"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
                placeholder="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={loadingTeam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {loadingTeam ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
    }`}
  >
    {icon} {label}
  </button>
);

const PricingCard = ({
  name,
  price,
  userPlan,
  features,
  isPopular,
  onUpgrade,
  loading,
}) => {
  // Safe check: pastikan userPlan ada string-nya sebelum di-lowercase
  const plan = userPlan ? userPlan.toLowerCase() : "free";
  const currentCardName = name.toLowerCase();

  // Logika: Jika user plan 'free', maka kartu 'Beginner'/'Free' aktif
  // Jika user plan 'pro', maka kartu 'Pro' aktif
  const isCurrent =
    plan === currentCardName ||
    (plan === "free" &&
      (currentCardName === "beginner" || currentCardName === "free"));

  return (
    <div
      className={`p-6 rounded-2xl border transition-all relative flex flex-col h-full ${
        isCurrent
          ? "border-blue-500 ring-2 ring-blue-500/10 bg-white dark:bg-slate-800"
          : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-600"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
          POPULAR
        </div>
      )}

      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">
        {name}
      </h4>
      <div className="my-2">
        <span className="text-3xl font-bold text-slate-800 dark:text-white">
          {price}
        </span>
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
          >
            <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />{" "}
            {f}
          </li>
        ))}
      </ul>

      <button
        disabled={isCurrent || loading}
        onClick={onUpgrade}
        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
          isCurrent
            ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30"
        }`}
      >
        {isCurrent ? "Current Plan" : loading ? "Processing..." : "Upgrade Now"}
      </button>
    </div>
  );
};

export default Dashboard;
