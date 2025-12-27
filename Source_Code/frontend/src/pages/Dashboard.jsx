// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Sparkles,
  LogOut,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronDown,
  Check,
  Building2,
  TrendingUp,
  Code
} from "lucide-react";

// --- COMPONENTS ---
import CeoDigestWidget from '../components/CeoDigestWidget';
import CreditBalance from '../components/CreditBalance';
import AiUsageChart from "../components/AiUsageChart";
import OnboardingTour from '../components/OnboardingTour'; // <--- New Feature

// --- HOOKS ---
import {
  useUserProfile,
  useTeams,
  useCreateTeam,
  useInviteMember,
  useGenerateAI,
  useCreateCheckout,
  usePortal,
} from "../hooks/queries/useQueries";

// --- CONFIGURATION ---
const AI_TOOLS = [
  {
    id: "business-email",
    label: "Professional Email",
    desc: "Generate formal business emails instantly.",
    inputs: [
      { name: "recipientName", label: "Recipient Name", placeholder: "e.g. John Doe" },
      { name: "topic", label: "Topic", placeholder: "e.g. Project Proposal" },
      { name: "keyPoints", label: "Key Points", type: "textarea", placeholder: "- Budget $5k\n- Deadline Friday" },
    ],
  },
  {
    id: "blog-outline",
    label: "Blog Post Outline",
    desc: "Create SEO-friendly outlines for your articles.",
    inputs: [
      { name: "title", label: "Blog Title", placeholder: "e.g. Top 10 SaaS Trends" },
      { name: "audience", label: "Target Audience", placeholder: "e.g. Startup Founders" },
    ],
  },
  {
    id: "pre-check",
    label: "AI Editor & Pre-Check",
    desc: "Validate drafts and check for sensitive data.",
    inputs: [
      { name: "title", label: "Document Title", placeholder: "e.g. Q3 Financial Report" },
      { name: "content", label: "Draft Content", type: "textarea", placeholder: "Paste your text here..." },
    ],
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeTeam, setActiveTeam] = useState(null);

  // Data Fetching
  const { data: user, isLoading: userLoading } = useUserProfile();
  const { data: teams, isLoading: teamsLoading } = useTeams();

  // Set Default Team
  useEffect(() => {
    if (teams && teams.length > 0 && !activeTeam) {
      setActiveTeam(teams[0]);
    }
  }, [teams, activeTeam]);

  if (userLoading || teamsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );
  }

  const userRole = teams
    ?.find((t) => t.id === activeTeam?.id)
    ?.members?.find((m) => m.userId === user.id)?.role;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* --- 0. ONBOARDING TOUR --- */}
      <OnboardingTour />

      {/* --- 1. SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <Sparkles className="fill-indigo-600" size={24} /> BusinessOS
          </h1>
        </div>

        <TeamSwitcher
          teams={teams || []}
          activeTeam={activeTeam}
          onSwitch={(team) => setActiveTeam(team)}
          onCreateNew={() => setActiveTab("team")}
        />

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <SidebarItem
            icon={<Sparkles size={20} />}
            label="AI Studio"
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
          />

          {(userRole === "OWNER" || userRole === "ADMIN") && (
            <SidebarItem
              icon={<Users size={20} />}
              label="Team Management"
              active={activeTab === "team"}
              onClick={() => setActiveTab("team")}
            />
          )}

          {userRole === "OWNER" && (
            <SidebarItem
              icon={<CreditCard size={20} />}
              label="Billing"
              active={activeTab === "billing"}
              onClick={() => setActiveTab("billing")}
            />
          )}

          <div className="mt-8 px-2">
            <Link
              to="/pricing"
              className="w-full flex justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-lg"
            >
              Upgrade Plan 🚀
            </Link>
          </div>
        </nav>

        {/* User Profile Section (ID for Tour) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50" id="team-profile-section">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
               src={user?.image || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
               alt="Profile" 
               className="w-9 h-9 rounded-full border border-slate-200"
            />
            <div className="overflow-hidden text-xs">
              <p className="font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-indigo-600 font-medium uppercase">
                {activeTeam?.plan || "Free"} Plan
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = "/auth/login";
            }}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 p-2 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- 2. MAIN CONTENT --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {activeTab === "overview" && (
          <OverviewTab activeTeam={activeTeam} user={user} setActiveTab={setActiveTab} />
        )}
        {activeTab === "ai" && <AITab activeTeam={activeTeam} />}
        {activeTab === "team" && <TeamTab activeTeam={activeTeam} />}
        {activeTab === "billing" && <BillingTab activeTeam={activeTeam} />}
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function OverviewTab({ activeTeam, user, setActiveTab }) {
  if (!activeTeam) return <div className="text-slate-400">Loading context...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* ID for Tour: Welcome */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4" id="dashboard-welcome">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
             Hello, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 mt-1">
             Here is the performance summary for <span className="font-bold text-indigo-600">{activeTeam.name}</span>.
          </p>
        </div>
        <div className="hidden md:block">
           <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 shadow-sm">
             📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* ID for Tour: CEO Digest */}
          <div id="ceo-digest-widget">
            <CeoDigestWidget teamId={activeTeam.id} />
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            {/* Header dihapus karena AiUsageChart sudah memilikinya */}
            <AiUsageChart teamId={activeTeam.id} /> 
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* ID for Tour: Credit Balance */}
          <div id="credit-balance-card">
             <CreditBalance teamId={activeTeam.id} />
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
             <h3 className="font-bold text-lg mb-4 relative z-10">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-3 relative z-10">
                <button 
                  onClick={() => setActiveTab("ai")}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-all backdrop-blur-sm"
                >
                  <Sparkles size={18} />
                  <span className="text-xs font-bold">New Content</span>
                </button>
                <button 
                  onClick={() => setActiveTab("team")}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex flex-col items-center gap-2 transition-all backdrop-blur-sm"
                >
                  <Users size={18} />
                  <span className="text-xs font-bold">Invite User</span>
                </button>
             </div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-30 blur-2xl"></div>
          </div>

          {/* ID for Tour: API Key Section */}
          <div id="api-key-section" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                   <Code size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Developer API</h3>
             </div>
             <p className="text-xs text-slate-500 mb-4">
                Connect your CRM or Apps directly to our AI Engine.
             </p>
             <button className="w-full py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                Manage Keys
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function AITab({ activeTeam }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [formData, setFormData] = useState({});
  const generate = useGenerateAI();

  if (!activeTeam) return <div className="text-slate-400">Please select a team.</div>;

  const handleGenerate = () => {
    generate.mutate({
      templateId: selectedTool.id,
      inputData: formData,
      teamId: activeTeam.id,
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Studio</h2>
        <p className="text-slate-500">Create content for <span className="font-bold text-slate-700">{activeTeam.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool);
                setFormData({});
                generate.reset();
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTool?.id === tool.id
                  ? "border-indigo-600 bg-white shadow-xl translate-x-2"
                  : "border-transparent bg-white hover:border-slate-200"
              }`}
            >
              <h3 className={`font-bold ${selectedTool?.id === tool.id ? "text-indigo-600" : "text-slate-800"}`}>
                {tool.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>

        <div className="md:col-span-2">
          {selectedTool ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-bold mb-6 text-slate-800">Configure {selectedTool.label}</h3>
              <div className="space-y-5">
                {selectedTool.inputs.map((input) => (
                  <div key={input.name}>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{input.label}</label>
                    {input.type === "textarea" ? (
                      <textarea
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                        rows={4}
                        placeholder={input.placeholder}
                        onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                        placeholder={input.placeholder}
                        onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleGenerate}
                  disabled={generate.isPending}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-3 transition-all"
                >
                  {generate.isPending ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  Generate
                </button>
                
                {generate.isSuccess && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-green-800 flex items-center gap-2"><CheckCircle size={16}/> Result</h4>
                            <button onClick={() => navigator.clipboard.writeText(generate.data.result)} className="text-xs text-green-600 font-bold hover:underline">Copy</button>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap text-sm">{generate.data.result}</p>
                    </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-4 border-dashed border-slate-100 rounded-3xl p-10">
              <Sparkles size={60} className="mb-4 text-slate-200" />
              <p className="font-medium">Select a tool on the left to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BillingTab({ activeTeam }) {
  const checkout = useCreateCheckout();
  const portal = usePortal();

  if (!activeTeam) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900">Billing & Subscription</h2>
        <p className="text-slate-500">Manage plan for: <span className="font-bold">{activeTeam.name}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard
          name="Free"
          price="$0"
          features={["2 Members", "10 AI Credits/day"]}
          current={activeTeam.plan === "Free"}
        />
        <PlanCard
          name="Pro"
          price="$29"
          features={["10 Members", "Unlimited AI", "Priority Support"]}
          current={activeTeam.plan === "Pro"}
          popular
          onUpgrade={() => checkout.mutate({ priceId: "price_pro_monthly", teamId: activeTeam.id })}
          loading={checkout.isPending}
        />
        <PlanCard
          name="Enterprise"
          price="$299"
          features={["Unlimited Members", "Custom AI Model", "Dedicated DB"]}
          current={activeTeam.plan === "Enterprise"}
          onUpgrade={() => checkout.mutate({ priceId: "price_ent_yearly", teamId: activeTeam.id })}
          loading={checkout.isPending}
        />
      </div>

      {activeTeam.stripeCustomerId && (
        <div className="mt-12 p-8 bg-indigo-600 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-indigo-200 gap-4">
          <div>
            <h4 className="text-xl font-bold">Billing Portal</h4>
            <p className="opacity-80 text-sm">Update credit card or download invoices.</p>
          </div>
          <button
            onClick={() => portal.mutate(activeTeam.id)}
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all w-full md:w-auto"
          >
            Open Customer Portal
          </button>
        </div>
      )}
    </div>
  );
}

function TeamTab({ activeTeam }) {
  const invite = useInviteMember();
  const createTeam = useCreateTeam();
  const [inviteEmail, setInviteEmail] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleInvite = async () => {
    try {
      const res = await invite.mutateAsync({ teamId: activeTeam.id, email: inviteEmail });
      setGeneratedLink(`${window.location.origin}/join/${res.token}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeTeam) return <div className="text-slate-400">Select a team first.</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Management</h2>
        <p className="text-slate-500">Manage members for <span className="font-bold text-slate-700">{activeTeam.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Plus size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800">Invite Member</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              placeholder="email@coworker.com"
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button
              onClick={handleInvite}
              disabled={invite.isPending || !inviteEmail}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {invite.isPending ? <Loader2 className="animate-spin" size={18} /> : <Copy size={18} />}
              Generate Link
            </button>
          </div>

          {generatedLink && (
            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-2xl animate-in zoom-in-95">
              <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle size={16} /> Link Ready:
              </p>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-green-200 shadow-sm">
                <code className="text-xs flex-1 truncate text-slate-600 font-mono">{generatedLink}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }}
                  className="p-2 hover:bg-slate-100 rounded-lg text-indigo-600"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
          <h3 className="text-xl font-bold mb-2">Create New Team</h3>
          <p className="text-slate-400 text-sm mb-6">Separate workspace for different projects.</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Team Name (e.g. Agency Alpha)"
              className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-4 focus:ring-white/10 text-white placeholder:text-slate-500"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button
              onClick={() => { createTeam.mutate(newTeamName); setNewTeamName(""); }}
              disabled={createTeam.isPending || !newTeamName}
              className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              {createTeam.isPending ? "Creating..." : "Create Team"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function TeamSwitcher({ teams, activeTeam, onSwitch, onCreateNew }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative mb-6 px-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white shrink-0">
            <Building2 size={16} />
          </div>
          <p className="text-sm font-bold text-slate-800 truncate">
            {activeTeam?.name || "Select Team"}
          </p>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => { onSwitch(t); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-sm"
            >
              <span className={activeTeam?.id === t.id ? "font-bold text-indigo-600" : ""}>{t.name}</span>
              {activeTeam?.id === t.id && <Check size={14} className="text-indigo-600" />}
            </button>
          ))}
          <button
            onClick={() => { onCreateNew(); setIsOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 border-t mt-2"
          >
            <Plus size={14} /> Create Team
          </button>
        </div>
      )}
    </div>
  );
}

function PlanCard({ name, price, features, current, popular, onUpgrade, loading }) {
  return (
    <div className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col ${popular ? "border-indigo-600 bg-white shadow-xl scale-105 z-10" : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg"}`}>
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">Most Popular</div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-2">{name}</h3>
        <div className="text-4xl font-black text-slate-900 flex items-baseline gap-1">
          {price}<span className="text-sm font-medium text-slate-400">/mo</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feat, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
            <CheckCircle className={`w-5 h-5 shrink-0 ${current || popular ? "text-indigo-600" : "text-slate-400"}`} />
            {feat}
          </li>
        ))}
      </ul>
      <button
        onClick={onUpgrade}
        disabled={current || loading}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${current ? "bg-slate-100 text-slate-400 cursor-default border border-slate-200" : popular ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95" : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"}`}
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {current ? "Current Plan" : "Upgrade Now"}
      </button>
    </div>
  );
}