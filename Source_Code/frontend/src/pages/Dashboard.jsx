import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, CreditCard, Sparkles, LogOut, 
  Plus, Loader2, CheckCircle, AlertCircle, Copy, ChevronDown, Check, Building2
} from "lucide-react";
import {
  useUserProfile, useTeams, useCreateTeam, useInviteMember, 
  useGenerateAI, useCreateCheckout, usePortal
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
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeTeam, setActiveTeam] = useState(null);

  const { data: user, isLoading: userLoading } = useUserProfile();
  const { data: teams, isLoading: teamsLoading } = useTeams();

  useEffect(() => {
    if (teams && teams.length > 0 && !activeTeam) {
      setActiveTeam(teams[0]);
    }
  }, [teams, activeTeam]);

  if (userLoading || teamsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Sparkles className="fill-blue-600" size={24} /> SaaS<span className="text-slate-800">Kit</span>
          </h1>
        </div>

        {/* 1. Team Switcher */}
        <TeamSwitcher 
          teams={teams || []} 
          activeTeam={activeTeam} 
          onSwitch={(team) => setActiveTeam(team)}
          onCreateNew={() => setActiveTab('team')} 
        />

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <SidebarItem icon={<Sparkles size={20} />} label="AI Tools" active={activeTab === "ai"} onClick={() => setActiveTab("ai")} />
          <SidebarItem icon={<Users size={20} />} label="Team Management" active={activeTab === "team"} onClick={() => setActiveTab("team")} />
          <SidebarItem icon={<CreditCard size={20} />} label="Billing" active={activeTab === "billing"} onClick={() => setActiveTab("billing")} />

          {/* 2. Usage Stats */}
          <div className="mt-8 px-2">
            {activeTeam && <UsageStats used={activeTeam.aiUsageCount || 0} max={activeTeam.aiLimitMax || 10} />}
          </div>
        </nav>

        {/* 3. User Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden text-xs">
              <p className="font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-blue-600 font-medium uppercase">{activeTeam?.plan || "Free"} Plan</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/auth"; }}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 p-2 rounded-lg text-sm transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab activeTeam={activeTeam} user={user} />}
        {activeTab === "ai" && <AITab activeTeam={activeTeam} />}
        {activeTab === "team" && <TeamTab activeTeam={activeTeam} />}
        {activeTab === "billing" && <BillingTab activeTeam={activeTeam} />}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-100"}`}>
      {icon} {label}
    </button>
  );
}

function TeamSwitcher({ teams, activeTeam, onSwitch, onCreateNew }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative mb-6 px-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white shrink-0"><Building2 size={16}/></div>
          <p className="text-sm font-bold text-slate-800 truncate">{activeTeam?.name || "Select Team"}</p>
        </div>
        <ChevronDown size={14} className="text-slate-400" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
          {teams.map(t => (
            <button key={t.id} onClick={() => {onSwitch(t); setIsOpen(false);}} className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-sm">
              <span className={activeTeam?.id === t.id ? "font-bold text-blue-600" : ""}>{t.name}</span>
              {activeTeam?.id === t.id && <Check size={14} className="text-blue-600"/>}
            </button>
          ))}
          <button onClick={() => {onCreateNew(); setIsOpen(false);}} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 border-t mt-2"><Plus size={14}/> Create Team</button>
        </div>
      )}
    </div>
  );
}

function UsageStats({ used, max }) {
  const percent = Math.min((used / max) * 100, 100);
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2"><span>AI USAGE</span><span>{used}/{max}</span></div>
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function AITab({ activeTeam }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [formData, setFormData] = useState({});
  const generate = useGenerateAI();

  if (!activeTeam) return <div className="text-slate-400">Please select a team first.</div>;

  const handleGenerate = () => {
    generate.mutate({ 
      templateId: selectedTool.id, 
      inputData: formData,
      teamId: activeTeam.id // Menggunakan ID dari tim aktif
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Tools</h2>
        <p className="text-slate-500">Generate professional content for <span className="font-bold text-slate-700">{activeTeam.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.id}
              onClick={() => { setSelectedTool(tool); setFormData({}); generate.reset(); }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTool?.id === tool.id ? "border-blue-600 bg-white shadow-xl translate-x-2" : "border-transparent bg-white hover:border-slate-200"
              }`}
            >
              <h3 className={`font-bold ${selectedTool?.id === tool.id ? "text-blue-600" : "text-slate-800"}`}>{tool.label}</h3>
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
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        rows={4}
                        onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        placeholder={input.placeholder}
                        onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleGenerate}
                  disabled={generate.isPending}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 flex justify-center items-center gap-3 transition-all active:scale-95"
                >
                  {generate.isPending ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  Generate Response
                </button>
                {/* Result & Error display... (sama seperti kode Anda) */}
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
        <p className="text-slate-500">Managing plans for team: <span className="font-bold">{activeTeam.name}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard
          name="Free"
          price="$0"
          features={["2 Members", "10 AI Credits"]}
          current={activeTeam.plan === "Free"}
        />
        <PlanCard
          name="Pro"
          price="$29"
          features={["10 Members", "Unlimited AI", "Priority"]}
          current={activeTeam.plan === "Pro"}
          popular
          onUpgrade={() => checkout.mutate(import.meta.env.VITE_PRICE_PRO)}
          loading={checkout.isPending}
        />
        {/* ... Plan Card lainnya ... */}
      </div>

      {activeTeam.stripeCustomerId && (
        <div className="mt-12 p-8 bg-blue-600 rounded-3xl text-white flex justify-between items-center shadow-2xl shadow-blue-200">
          <div>
            <h4 className="text-xl font-bold">Billing Management</h4>
            <p className="opacity-80 text-sm">Update payment method or download invoices.</p>
          </div>
          <button
            onClick={() => portal.mutate()}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all"
          >
            Open Stripe Portal
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

  // Handler untuk membuat link undangan
  const handleInvite = async () => {
    try {
      const res = await invite.mutateAsync({ 
        teamId: activeTeam.id, 
        email: inviteEmail 
      });
      
      // Membuat URL lengkap: domain-anda.com/join/token-dari-backend
      const link = `${window.location.origin}/join/${res.token}`;
      setGeneratedLink(link);
    } catch (err) {
      console.error("Gagal membuat undangan:", err);
    }
  };

  if (!activeTeam) return <div className="text-slate-400">Silakan pilih atau buat tim terlebih dahulu.</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Management</h2>
        <p className="text-slate-500">Kelola anggota dan kolaborasi untuk <span className="font-bold text-slate-700">{activeTeam.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* SECTION 1: INVITE MEMBERS */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Plus size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Undang Anggota Baru</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="email" 
              placeholder="email@rekan-tim.com" 
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button 
              onClick={handleInvite}
              disabled={invite.isPending || !inviteEmail}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {invite.isPending ? <Loader2 className="animate-spin" size={18}/> : <Copy size={18}/>}
              Buat Link Undangan
            </button>
          </div>

          {/* Menampilkan Link yang Berhasil Dibuat */}
          {generatedLink && (
            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-2xl animate-in zoom-in-95 duration-300">
              <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle size={16} /> Link Undangan Siap Dikirim:
              </p>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-green-200 shadow-sm">
                <code className="text-xs flex-1 truncate text-slate-600 font-mono">{generatedLink}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    alert("Link berhasil disalin!");
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg text-blue-600 transition-colors"
                  title="Salin Link"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-[11px] text-green-600 mt-3 italic">
                * Anggota yang mengklik link ini akan otomatis bergabung ke tim sebagai <b>Member</b>.
              </p>
            </div>
          )}

          {invite.isError && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} /> {invite.error.response?.data?.error || "Gagal mengundang anggota."}
            </div>
          )}
        </div>

        {/* SECTION 2: CREATE NEW TEAM */}
        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
          <h3 className="text-xl font-bold mb-2">Buat Tim Baru?</h3>
          <p className="text-slate-400 text-sm mb-6">Buat workspace terpisah untuk proyek atau klien lain.</p>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Nama Tim (cth: Marketing Agency)" 
              className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:ring-4 focus:ring-white/10 text-white placeholder:text-slate-500"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button 
              onClick={() => { createTeam.mutate(newTeamName); setNewTeamName(""); }}
              disabled={createTeam.isPending || !newTeamName}
              className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              {createTeam.isPending ? "Sedang Membuat..." : "Buat Tim"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function OverviewTab({ activeTeam, user }) {
  if (!activeTeam) return <div className="text-slate-400">Loading team data...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* GREETING */}
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Selamat Datang, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-500 mt-1">
          Berikut adalah ringkasan aktivitas untuk tim <span className="font-bold text-slate-700">{activeTeam.name}</span> hari ini.
        </p>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          icon={<Sparkles className="text-blue-600" size={20} />}
          label="Penggunaan AI"
          value={`${activeTeam.aiUsageCount} / ${activeTeam.aiLimitMax}`}
          desc="Kredit digunakan bulan ini"
          progress={(activeTeam.aiUsageCount / activeTeam.aiLimitMax) * 100}
        />
        <StatCard 
          icon={<Users className="text-indigo-600" size={20} />}
          label="Anggota Tim"
          value={`${activeTeam._count?.members || 1} Personel`}
          desc="Aktif dalam workspace"
        />
        <StatCard 
          icon={<CreditCard className="text-emerald-600" size={20} />}
          label="Paket Langganan"
          value={activeTeam.plan}
          desc={activeTeam.plan === 'Free' ? 'Upgrade untuk fitur lebih' : 'Paket Enterprise Aktif'}
          isPlan
        />
      </div>

      {/* QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionButton 
              label="Buat Konten AI" 
              icon={<Sparkles size={18}/>} 
              color="bg-blue-600"
            />
            <QuickActionButton 
              label="Undang Teman" 
              icon={<Plus size={18}/>} 
              color="bg-slate-800"
            />
          </div>
        </div>

        {/* Audit Log / Activity - Visual Only */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Aktivitas Terakhir</h3>
          <div className="space-y-4">
            <ActivityItem 
              text="Anda membuat email bisnis" 
              time="2 menit yang lalu" 
              icon={<Sparkles size={14}/>} 
            />
            <ActivityItem 
              text="Anggota baru bergabung: Rian" 
              time="1 jam yang lalu" 
              icon={<Users size={14}/>} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SMALL INTERNAL COMPONENTS FOR OVERVIEW ---

function StatCard({ icon, label, value, desc, progress, isPlan }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900 mb-1">{value}</div>
      <p className="text-xs text-slate-400 mb-4">{desc}</p>
      
      {progress !== undefined && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {isPlan && (
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          TERVERIFIKASI
        </span>
      )}
    </div>
  );
}

function QuickActionButton({ label, icon, color }) {
  return (
    <button className={`p-4 ${color} text-white rounded-2xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95`}>
      {icon}
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

function ActivityItem({ text, time, icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium">{text}</p>
        <p className="text-[10px] text-slate-400">{time}</p>
      </div>
    </div>
  );
}