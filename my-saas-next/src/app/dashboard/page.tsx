'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  slug: string;
  tier: string;
  aiUsageCount: number;
  aiTokenLimit: number;
  memberCount: number;
  myRole: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        localStorage.removeItem('token');
        router.push('/auth/login');
        return;
      }

      setUser(data.user);
      setTeams(data.teams);
      setActiveTeam(data.activeTeam);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SaaSName
          </h1>
        </div>

        {/* Team Switcher */}
        <div className="p-4 border-b border-gray-100">
          <select
            value={activeTeam?.id || ''}
            onChange={(e) => {
              const team = teams.find(t => t.id === e.target.value);
              if (team) setActiveTeam(team);
            }}
            className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'ai', label: 'AI Tools', icon: '✨' },
            { id: 'team', label: 'Team', icon: '👥' },
            { id: 'billing', label: 'Billing', icon: '💳' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <Link
            href="/dashboard/knowledge-base"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 hover:bg-gray-50 transition-all"
          >
            <span>📚</span>
            Knowledge Base
          </Link>

          <Link
            href="/dashboard/setting"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-600 hover:bg-gray-50 transition-all"
          >
            <span>⚙️</span>
            Settings
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === 'overview' && <OverviewTab team={activeTeam} user={user} />}
        {activeTab === 'ai' && <AITab team={activeTeam} />}
        {activeTab === 'team' && <TeamTab team={activeTeam} />}
        {activeTab === 'billing' && <BillingTab team={activeTeam} />}
      </main>
    </div>
  );
}

// Overview Tab
function OverviewTab({ team, user }: { team: Team | null; user: User | null }) {
  const quotaPercent = team ? Math.round((team.aiUsageCount / team.aiTokenLimit) * 100) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Selamat datang, {user?.name?.split(' ')[0]}! 👋
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* AI Quota Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">AI Quota</h3>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {team?.aiTokenLimit ? team.aiTokenLimit - team.aiUsageCount : 0}
          </p>
          <p className="text-sm text-gray-500 mb-3">tokens tersisa</p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${quotaPercent > 80 ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>

        {/* Team Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Tim Anda</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{team?.memberCount || 0}</p>
          <p className="text-sm text-gray-500">anggota aktif</p>
        </div>

        {/* Plan Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/80">Plan Saat Ini</h3>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold mb-2">{team?.tier || 'FREE'}</p>
          <Link 
            href="/pricing"
            className="text-sm text-white/80 hover:text-white underline"
          >
            {team?.tier === 'FREE' ? 'Upgrade sekarang →' : 'Kelola plan →'}
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Generate Email', icon: '📧', href: '#' },
          { label: 'Chat with Docs', icon: '💬', href: '/dashboard/knowledge-base' },
          { label: 'Invite Member', icon: '➕', href: '#' },
          { label: 'View Analytics', icon: '📈', href: '#' },
        ].map(action => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all text-center"
          >
            <span className="text-2xl block mb-2">{action.icon}</span>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// AI Tab
function AITab({ team }: { team: Team | null }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.data) setResult(data.data);
      else throw new Error(data.error);
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Tools ✨</h2>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Business Analyzer</h3>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Deskripsikan apa yang ingin Anda analisis..."
          className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-700 mb-2">Result:</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Team Tab
function TeamTab({ team }: { team: Team | null }) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    if (!email.trim() || !team) return;
    
    setInviting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamId: team.id, email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Undangan terkirim ke ${email}!`);
        setEmail('');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Management 👥</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Undang Anggota Baru</h3>
          
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleInvite}
              disabled={inviting || !email.trim()}
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {inviting ? '...' : 'Kirim'}
            </button>
          </div>

          {message && (
            <p className={`mt-3 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>

        {/* Team Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Info Tim</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Nama Tim</span>
              <span className="font-medium">{team?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Anggota</span>
              <span className="font-medium">{team?.memberCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role Anda</span>
              <span className="font-medium capitalize">{team?.myRole?.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Billing Tab
function BillingTab({ team }: { team: Team | null }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePortal = async () => {
    setLoading('portal');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamId: team?.id })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Plan 💳</h2>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Plan Saat Ini</h3>
            <p className="text-gray-500">Tim: {team?.name}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            team?.tier === 'PRO' 
              ? 'bg-purple-100 text-purple-700' 
              : team?.tier === 'ENTERPRISE'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {team?.tier || 'FREE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">AI Token Limit</p>
            <p className="text-2xl font-bold text-gray-900">{team?.aiTokenLimit?.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Used This Month</p>
            <p className="text-2xl font-bold text-gray-900">{team?.aiUsageCount?.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/pricing"
            className="flex-1 py-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            {team?.tier === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
          </Link>
          
          {team?.tier !== 'FREE' && (
            <button
              onClick={handlePortal}
              disabled={loading === 'portal'}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {loading === 'portal' ? 'Loading...' : 'Manage Billing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
