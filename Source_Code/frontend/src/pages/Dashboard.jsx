// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Home,
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
} from "lucide-react";

// --- HOOKS (Sistem Baru) ---
import useTheme from "../hooks/useTheme";
import { useUserProfile } from "../hooks/queries/useUserQuery";
import { useTeams, useCreateTeam } from "../hooks/queries/useTeamQuery";
import { useGenerateContent } from "../hooks/queries/useAiQuery";
import { useBillingMutation } from "../hooks/queries/useBillingQuery";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // --- STATE UI (Hanya untuk Tampilan, bukan Data) ---
  const [activeTab, setActiveTab] = useState("overview");
  const [prompt, setPrompt] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  // --- 1. DATA FETCHING (React Query) ---
  // Otomatis fetch data, cache, dan handle loading
  const { data: user, isLoading: userLoading, error: userError } = useUserProfile();
  const { data: teams = [] } = useTeams(); // Default array kosong agar tidak error

  // --- 2. MUTATIONS (Aksi Tombol) ---
  const createTeamMutation = useCreateTeam();
  const aiMutation = useGenerateContent();
  const { createCheckout, cancelSubscription, resumeSubscription } = useBillingMutation();

  // --- LOGIC HANDLERS ---
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleCreateTeam = () => {
    if (!newTeamName) return;
    createTeamMutation.mutate(newTeamName, {
      onSuccess: () => {
        setShowCreateTeamModal(false);
        setNewTeamName("");
      }
    });
  };

  const handleGenerateAI = () => {
    if (!prompt) return;
    aiMutation.mutate(prompt);
  };

  // --- BILLING HANDLERS ---
  const PLAN_PRICES = {
    Pro: import.meta.env.VITE_STRIPE_PRICE_PRO,
    Team: import.meta.env.VITE_STRIPE_PRICE_TEAM,
  };

  const handleUpgrade = (planName) => {
    const priceId = PLAN_PRICES[planName];
    if (!priceId) return alert("Paket belum tersedia di .env");
    createCheckout.mutate({ userId: user.id, priceId });
  };

  const handleCancel = () => {
    if (confirm("Yakin ingin membatalkan langganan?")) {
      cancelSubscription.mutate({ userId: user.id });
    }
  };

  const handleResume = () => {
    resumeSubscription.mutate({ userId: user.id });
  };

  // --- LOADING SCREEN ---
  // Tampilkan loader full screen hanya saat mengambil data User awal
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-primary-600 w-8 h-8" />
      </div>
    );
  }

  // Jika error (misal token expired atau server mati)
  if (userError) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <p className="text-red-500 mb-4">Gagal memuat profil.</p>
            <button onClick={() => navigate('/auth')} className="text-primary-600 underline">Kembali ke Login</button>
        </div>
    )
  }

  // Helper Variables
  const isPremium = user.plan !== "Free" && user.plan !== "free";
  const isActive = user.subscriptionStatus === "active" && !user.cancelAtPeriodEnd;

  // --- CONTENT RENDERER ---
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* GRID SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Billing */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary-600">
                    <CreditCard size={20} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    {isActive ? "Active" : "Basic"}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Current Plan</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 capitalize">{user.plan}</h3>
                <button onClick={() => setActiveTab("billing")} className="text-sm text-primary-600 mt-4 font-medium hover:underline flex items-center gap-1">
                  Manage Subscription <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 2: Teams */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {teams?.length || 0} Teams
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Collaborations</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {teams?.length > 0 ? `${teams.length} Active Groups` : "No Teams Yet"}
                </h3>
              </div>

              {/* Card 3: AI CTA */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
                <div className="p-2 bg-white/20 rounded-lg text-white w-fit mb-4">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Generate Content</h3>
                <p className="text-indigo-100 text-sm mt-1 leading-relaxed">Need ideas? Use our AI to write instantly.</p>
                <button onClick={() => setActiveTab("ai")} className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                  Open AI Tools
                </button>
              </div>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Content Generator</h2>
                <p className="text-slate-500 dark:text-slate-400">Unlimited generation for Pro members.</p>
              </div>

              <textarea
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 dark:text-slate-200 resize-none min-h-[150px]"
                placeholder="What do you want to create today?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleGenerateAI}
                  disabled={aiMutation.isPending || !prompt}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {aiMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
                  {aiMutation.isPending ? "Generating..." : "Generate Content"}
                </button>
              </div>

              {/* Error Box */}
              {aiMutation.isError && (
                 <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    Error: {aiMutation.error?.response?.data?.error || "Something went wrong"}
                 </div>
              )}

              {/* Result Box */}
              {aiMutation.isSuccess && aiMutation.data && (
                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Result</p>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {/* Parsing JSON response dari backend */}
                    {JSON.parse(aiMutation.data.result)}
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
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Team Management</h2>
              <button onClick={() => setShowCreateTeamModal(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-all">
                <Plus size={18} /> New Team
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {teams.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Users size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No teams yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Create a team to organize your projects.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teams.map((team) => (
                    <div key={team.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">{team.name}</h4>
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
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Subscription Plans</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Pilih paket yang sesuai dengan kebutuhan tim Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <PricingCard
                name="Free" price="$0" userPlan={user.plan}
                features={["Basic Analytics", "3 AI Credits/day", "1 Team Member"]}
              />
              <PricingCard
                name="Pro" price="$24" userPlan={user.plan} isPopular
                features={["Unlimited AI", "Priority Support", "5 Team Members"]}
                onUpgrade={() => handleUpgrade("Pro")}
                loading={createCheckout.isPending} // Gunakan state loading dari mutation
              />
              <PricingCard
                name="Team" price="$72" userPlan={user.plan}
                features={["Unlimited Everything", "SSO Integration", "Unlimited Teams"]}
                onUpgrade={() => handleUpgrade("Team")}
                loading={createCheckout.isPending} // Gunakan state loading dari mutation
              />
            </div>

            {isPremium && (
              <div className="max-w-3xl mx-auto mt-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${user.cancelAtPeriodEnd ? "bg-yellow-100 text-yellow-600" : "bg-emerald-100 text-emerald-600"}`}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Status Langganan</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.cancelAtPeriodEnd ? "Langganan akan berakhir pada akhir periode ini." : "Langganan Anda aktif (Auto-renew)."}
                    </p>
                  </div>
                </div>

                {user.cancelAtPeriodEnd ? (
                  <button onClick={handleResume} disabled={resumeSubscription.isPending} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-all shadow-md">
                    {resumeSubscription.isPending ? "Memproses..." : "Lanjutkan Langganan"}
                  </button>
                ) : (
                  <button onClick={handleCancel} disabled={cancelSubscription.isPending} className="px-5 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-all">
                    {cancelSubscription.isPending ? "Memproses..." : "Batalkan Langganan"}
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
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Settings Coming Soon</h3>
            <p>Profile and notification preferences will be here.</p>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-poppins transition-colors duration-300">
      {/* SIDEBAR & HEADER (Hampir sama, hanya fungsi logout dirapikan) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 hidden md:flex flex-col p-6 fixed h-full z-10">
        <div className="text-2xl font-bold text-blue-700 mb-10 tracking-tight">
          SaaS<span className="text-slate-800 dark:text-white">Board</span>
        </div>
        <nav className="flex-1 space-y-2">
          {['overview', 'ai', 'team', 'billing', 'settings'].map(tab => (
              <NavItem 
                key={tab} 
                label={tab.charAt(0).toUpperCase() + tab.slice(1)} 
                active={activeTab === tab} 
                onClick={() => setActiveTab(tab)} 
                // Icon mapping sederhana, bisa disesuaikan
                icon={tab === 'overview' ? <Home size={20}/> : tab === 'ai' ? <Sparkles size={20}/> : tab === 'team' ? <Users size={20}/> : tab === 'billing' ? <CreditCard size={20}/> : <Settings size={20}/>}
              />
          ))}
        </nav>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-red-500 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8 relative">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">{activeTab}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 dark:text-slate-400">Welcome, <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span></p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${isPremium ? "bg-blue-50 text-primary-600 border-blue-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {user.plan} Plan
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary-600 transition-all">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-10 w-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {renderContent()}

        {/* MODAL (Hanya logic submit yang berubah) */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Create Team</h3>
              <input
                type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 focus:ring-2 focus:ring-primary-500 outline-none text-slate-800 dark:text-white"
                placeholder="Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreateTeamModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                <button onClick={handleCreateTeam} disabled={createTeamMutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                  {createTeamMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS (Sama seperti sebelumnya) ---
const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-blue-50 text-primary-600 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
    {icon} {label}
  </button>
);

const PricingCard = ({ name, price, userPlan, features, isPopular, onUpgrade, loading }) => {
  const plan = userPlan ? userPlan.toLowerCase() : "free";
  const currentCardName = name.toLowerCase();
  const isCurrent = plan === currentCardName || (plan === "free" && (currentCardName === "beginner" || currentCardName === "free"));

  return (
    <div className={`p-6 rounded-2xl border transition-all relative flex flex-col h-full ${isCurrent ? "border-blue-500 ring-2 ring-primary-500/10 bg-white dark:bg-slate-800" : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-600"}`}>
      {isPopular && <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>}
      <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">{name}</h4>
      <div className="my-2"><span className="text-3xl font-bold text-slate-800 dark:text-white">{price}</span></div>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f, i) => (<li key={i} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CheckCircle size={14} className="text-blue-500 flex-shrink-0" /> {f}</li>))}
      </ul>
      <button disabled={isCurrent || loading} onClick={onUpgrade} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${isCurrent ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default" : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30"}`}>
        {isCurrent ? "Current Plan" : loading ? "Processing..." : "Upgrade Now"}
      </button>
    </div>
  );
};

export default Dashboard;