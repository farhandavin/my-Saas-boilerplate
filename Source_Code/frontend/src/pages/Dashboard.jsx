import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, CreditCard, Sparkles, LogOut, 
  Plus, Loader2, CheckCircle, AlertCircle, Copy 
} from 'lucide-react';
import { 
  useUserProfile, useTeams, useCreateTeam, useInviteMember, 
  useGenerateAI, useCreateCheckout, usePortal 
} from '../hooks/queries/useQueries';

// Konfigurasi Tools AI (Sesuai Backend Tahap 1)
const AI_TOOLS = [
  {
    id: 'business-email',
    label: 'Professional Email',
    desc: 'Generate formal business emails instantly.',
    inputs: [
      { name: 'recipientName', label: 'Recipient Name', placeholder: 'e.g. John Doe' },
      { name: 'topic', label: 'Topic', placeholder: 'e.g. Project Proposal' },
      { name: 'keyPoints', label: 'Key Points', type: 'textarea', placeholder: '- Budget $5k\n- Deadline Friday' }
    ]
  },
  {
    id: 'blog-outline',
    label: 'Blog Post Outline',
    desc: 'Create SEO-friendly outlines for your articles.',
    inputs: [
      { name: 'title', label: 'Blog Title', placeholder: 'e.g. Top 10 SaaS Trends' },
      { name: 'audience', label: 'Target Audience', placeholder: 'e.g. Startup Founders' }
    ]
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('ai'); // Default tab
  
  // Data Fetching
  const { data: user, isLoading: userLoading } = useUserProfile();
  
  if (userLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Sparkles className="fill-blue-600" /> SaaS<span className="text-slate-800">Kit</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<Sparkles size={20}/>} label="AI Tools" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
          <SidebarItem icon={<Users size={20}/>} label="Team Management" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
          <SidebarItem icon={<CreditCard size={20}/>} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.plan} Plan</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.href='/auth'; }}
            className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'ai' && <AITab user={user} />}
        {activeTab === 'team' && <TeamTab user={user} />}
        {activeTab === 'billing' && <BillingTab user={user} />}
        {activeTab === 'overview' && <OverviewTab user={user} />}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS (Agar file rapi) ---

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// 1. AI TOOLS TAB
function AITab({ user }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [formData, setFormData] = useState({});
  const generate = useGenerateAI();

  const handleGenerate = () => {
    generate.mutate({ templateId: selectedTool.id, inputData: formData });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">AI Generator</h2>
        <p className="text-slate-500">Create professional content in seconds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LIST TOOLS */}
        <div className="space-y-4">
          {AI_TOOLS.map(tool => (
            <div 
              key={tool.id}
              onClick={() => { setSelectedTool(tool); setFormData({}); generate.reset(); }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedTool?.id === tool.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <h3 className="font-semibold text-slate-800">{tool.label}</h3>
              <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
            </div>
          ))}
        </div>

        {/* FORM & RESULT AREA */}
        <div className="md:col-span-2">
          {selectedTool ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-4">{selectedTool.label}</h3>
              <div className="space-y-4">
                {selectedTool.inputs.map(input => (
                  <div key={input.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{input.label}</label>
                    {input.type === 'textarea' ? (
                      <textarea 
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                        onChange={e => setFormData({...formData, [input.name]: e.target.value})}
                      />
                    ) : (
                      <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={input.placeholder}
                        onChange={e => setFormData({...formData, [input.name]: e.target.value})}
                      />
                    )}
                  </div>
                ))}
                
                <button 
                  onClick={handleGenerate}
                  disabled={generate.isPending}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {generate.isPending ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                  Generate Content
                </button>

                {generate.isError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {generate.error.response?.data?.error || "Failed to generate."}
                  </div>
                )}

                {generate.isSuccess && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">{generate.data.data.data}</pre>
                    <button 
                      className="absolute top-2 right-2 text-slate-400 hover:text-blue-600"
                      onClick={() => navigator.clipboard.writeText(generate.data.data.data)}
                    >
                      <Copy size={16}/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-10">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p>Select a tool to start creating</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. TEAMS TAB
function TeamTab({ user }) {
  const { data: teams } = useTeams();
  const createTeam = useCreateTeam();
  const invite = useInviteMember();
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Team Management</h2>
          <p className="text-slate-500">Collaborate with your organization.</p>
        </div>
      </div>

      {/* CREATE TEAM INPUT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h3 className="font-bold text-sm uppercase text-slate-500 mb-4">Create New Team</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Team Name (e.g. Marketing)" 
            className="flex-1 p-2 border border-slate-300 rounded-lg"
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
          />
          <button 
            onClick={() => { createTeam.mutate(newTeamName); setNewTeamName(''); }}
            disabled={createTeam.isPending || !newTeamName}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900"
          >
            {createTeam.isPending ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </div>

      {/* TEAM LIST */}
      <div className="space-y-6">
        {teams?.map(team => (
          <div key={team.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{team.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                  {team._count.members} Members
                </span>
              </div>
              {/* INVITE FORM PER TEAM */}
              <div className="flex gap-2">
                 <input 
                  type="email" 
                  placeholder="Invite Email" 
                  className="p-2 border border-slate-300 rounded-lg text-sm w-64"
                  onChange={(e) => setInviteEmail(e.target.value)}
                 />
                 <button 
                  onClick={() => invite.mutate({ teamId: team.id, email: inviteEmail })}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                 >
                   Invite
                 </button>
              </div>
            </div>
            
            {invite.isError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <AlertCircle size={16}/> {invite.error.response?.data?.error}
              </div>
            )}
            
            {invite.isSuccess && invite.data?.data?.token && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
                <b>Dev Mode Only:</b> Invitation Token: {invite.data.data.token}
              </div>
            )}
          </div>
        ))}
        
        {teams?.length === 0 && (
           <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
             <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
             <h3 className="text-slate-500 font-medium">No teams yet</h3>
             <p className="text-slate-400 text-sm">Create your first team above to get started.</p>
           </div>
        )}
      </div>
    </div>
  );
}

// 3. BILLING TAB
function BillingTab({ user }) {
  const checkout = useCreateCheckout();
  const portal = usePortal();
  
  // Ambil Price ID dari environment variable Frontend
  // Pastikan Anda set di .env: VITE_PRICE_PRO=price_xxx, VITE_PRICE_TEAM=price_yyy
  const PRICE_PRO = import.meta.env.VITE_PRICE_PRO; 
  const PRICE_TEAM = import.meta.env.VITE_PRICE_TEAM;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Subscription Plan</h2>
        <p className="text-slate-500">Upgrade to unlock unlimited AI & Team members.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE PLAN */}
        <PlanCard 
          name="Free" price="$0" features={['2 Team Members', 'Limited AI Usage']}
          current={user.plan === 'Free'} 
        />
        
        {/* PRO PLAN */}
        <PlanCard 
          name="Pro" price="$29" features={['5 Team Members', 'Unlimited AI', 'Priority Support']}
          current={user.plan === 'Pro'}
          popular
          onUpgrade={() => checkout.mutate(PRICE_PRO)}
          loading={checkout.isPending}
        />
        
        {/* TEAM PLAN */}
        <PlanCard 
          name="Team" price="$79" features={['Unlimited Members', 'Unlimited AI', 'API Access']}
          current={user.plan === 'Team'}
          onUpgrade={() => checkout.mutate(PRICE_TEAM)}
          loading={checkout.isPending}
        />
      </div>

      {user.stripeCustomerId && (
        <div className="mt-8 p-6 bg-slate-100 rounded-xl flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-700">Billing Portal</h4>
            <p className="text-sm text-slate-500">Download invoices or cancel subscription.</p>
          </div>
          <button 
            onClick={() => portal.mutate()}
            className="text-blue-600 font-medium hover:underline"
          >
            Manage Billing &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

function PlanCard({ name, price, features, current, popular, onUpgrade, loading }) {
  return (
    <div className={`p-6 rounded-2xl border flex flex-col relative ${current ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'bg-white border-slate-200'}`}>
      {popular && <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">POPULAR</div>}
      <h3 className="text-lg font-bold text-slate-800">{name}</h3>
      <div className="my-4"><span className="text-3xl font-bold">{price}</span>/mo</div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600"><CheckCircle size={16} className="text-green-500"/> {f}</li>
        ))}
      </ul>
      <button 
        disabled={current || loading}
        onClick={onUpgrade}
        className={`w-full py-2 rounded-lg font-medium transition-all ${
          current ? 'bg-slate-200 text-slate-500 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {current ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade'}
      </button>
    </div>
  );
}

function OverviewTab({ user }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome back, {user.name}!</h2>
      <p className="text-slate-500 max-w-lg mx-auto">
        Your dashboard is ready. Start by generating some content using AI or invite your team members.
      </p>
    </div>
  );
}