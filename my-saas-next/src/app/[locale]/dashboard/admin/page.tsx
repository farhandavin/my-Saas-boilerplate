'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // const token = localStorage.getItem('token');
    // if (!token) {
    //   router.push('/auth');
    //   return;
    // }

    try {
      const res = await fetch('/api/auth/me', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        // localStorage.removeItem('token');
        router.push('/auth');
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-10 w-10 border-4 border-[#137fec] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-[#0d141b] dark:text-white md:text-4xl">
             Good Morning, {firstName}
           </h1>
           <p className="mt-2 text-base font-medium text-[#4c739a] dark:text-[#93aebf]">
             Here's your briefing for today.
           </p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.02]">
             <span className="material-symbols-outlined text-lg">add</span>
             Quick Action
           </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {['Overview', 'Strategy', 'Operations', 'People', 'Settings'].map((tab) => {
             const tabKey = tab.toLowerCase();
             const isActive = activeTab === tabKey;
             return (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tabKey)}
                 className={`
                   whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                   ${isActive 
                     ? 'border-[#137fec] text-[#137fec] dark:text-blue-400' 
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                 `}
               >
                 {tab}
               </button>
             );
          })}
        </nav>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* MRR Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-[#1a2632] dark:shadow-none dark:ring-1 dark:ring-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    12.5%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-[#4c739a] dark:text-[#93aebf]">Monthly Recurring Revenue</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#0d141b] dark:text-white">$52,450</p>
                </div>
              </div>

              {/* Profit Margin Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-[#1a2632] dark:shadow-none dark:ring-1 dark:ring-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <span className="material-symbols-outlined">pie_chart</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    5.2%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-[#4c739a] dark:text-[#93aebf]">Net Profit Margin</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#0d141b] dark:text-white">24.8%</p>
                </div>
              </div>

              {/* Cash on Hand Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-[#1a2632] dark:shadow-none dark:ring-1 dark:ring-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex w-10 h-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-sm">remove</span>
                    0.0%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-[#4c739a] dark:text-[#93aebf]">Cash on Hand</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#0d141b] dark:text-white">$120,000</p>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* CEO Digest */}
              <div className="flex flex-col gap-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0d141b] dark:text-white">CEO Digest</h2>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#4c739a] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-[#93aebf] dark:ring-slate-700 transition-colors">Daily</button>
                    <button className="rounded-lg bg-[#137fec]/10 px-3 py-1.5 text-xs font-bold text-[#137fec] dark:bg-[#137fec]/20 transition-colors">Weekly</button>
                  </div>
                </div>

                <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1a2632] dark:shadow-none dark:ring-1 dark:ring-white/10">
                  {/* Mini Metrics */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#4c739a] dark:text-[#93aebf]">Strategic Focus</p>
                          <h4 className="mt-1 font-bold text-[#0d141b] dark:text-white">Q4 Expansion</h4>
                        </div>
                        <span className="flex w-7 h-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <span className="material-symbols-outlined text-base">flag</span>
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[#4c739a]">Progress</span>
                          <span className="text-[#137fec] font-bold">85%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-full w-[85%] rounded-full bg-[#137fec]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#4c739a] dark:text-[#93aebf]">Burn Rate</p>
                          <h4 className="mt-1 font-bold text-[#0d141b] dark:text-white">$12.4k / mo</h4>
                        </div>
                        <span className="flex w-7 h-7 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <span className="material-symbols-outlined text-base">trending_down</span>
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-green-600 dark:text-green-400">arrow_downward</span>
                        <p className="text-xs font-bold text-green-600 dark:text-green-400">4.2% optimized</p>
                        <span className="text-xs text-[#4c739a] dark:text-[#93aebf]">vs last mo</span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#4c739a] dark:text-[#93aebf]">Acquisition</p>
                          <h4 className="mt-1 font-bold text-[#0d141b] dark:text-white">+842 Users</h4>
                        </div>
                        <span className="flex w-7 h-7 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          <span className="material-symbols-outlined text-base">group_add</span>
                        </span>
                      </div>
                      <div className="mt-4 flex items-center -space-x-2">
                        <div className="flex w-6 h-6 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[8px] font-bold text-blue-600 dark:border-slate-800 dark:bg-blue-900 dark:text-blue-300">JD</div>
                        <div className="flex w-6 h-6 items-center justify-center rounded-full border-2 border-white bg-purple-100 text-[8px] font-bold text-purple-600 dark:border-slate-800 dark:bg-purple-900 dark:text-purple-300">AS</div>
                        <div className="flex w-6 h-6 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-[8px] font-bold text-emerald-600 dark:border-slate-800 dark:bg-emerald-900 dark:text-emerald-300">MK</div>
                        <div className="flex w-6 h-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-[#4c739a] dark:border-slate-800 dark:bg-slate-700 dark:text-[#93aebf]">+800</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/20">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-[#0d141b] dark:text-white">Recent Activity</h3>
                      <button className="text-xs text-[#137fec] hover:underline font-medium">View All</button>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <span className="material-symbols-outlined text-base">arrow_upward</span>
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="text-sm font-bold text-[#0d141b] dark:text-white">Stripe Payout</p>
                          <span className="text-[10px] font-medium text-[#4c739a] dark:text-[#93aebf]">Today, 10:42 AM</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">+$4,200</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          <span className="material-symbols-outlined text-base">receipt_long</span>
                        </div>
                        <div className="flex flex-1 flex-col">
                          <p className="text-sm font-bold text-[#0d141b] dark:text-white">AWS Invoice</p>
                          <span className="text-[10px] font-medium text-[#4c739a] dark:text-[#93aebf]">Yesterday</span>
                        </div>
                        <span className="text-xs font-bold text-[#0d141b] dark:text-white">-$850</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Intel */}
              <div className="flex flex-col gap-4 lg:col-span-1">
                <h2 className="text-xl font-bold text-[#0d141b] dark:text-white">Operational Intel</h2>
                <div className="flex flex-1 flex-col gap-4">
                  {/* AI Token Usage */}
                  <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1a2632] dark:shadow-none dark:ring-1 dark:ring-white/10">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-[#0d141b] dark:text-white">AI Token Usage</h3>
                      <span className="rounded bg-[#137fec]/10 px-2 py-0.5 text-xs font-bold text-[#137fec] dark:bg-[#137fec]/20">Live</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex justify-between text-xs font-medium">
                          <span className="text-[#4c739a] dark:text-[#93aebf]">GPT-4 Turbo</span>
                          <span className="text-[#0d141b] dark:text-white">78%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-full w-[78%] rounded-full bg-[#137fec] transition-all duration-1000"></div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs font-medium">
                          <span className="text-[#4c739a] dark:text-[#93aebf]">Claude 3.5</span>
                          <span className="text-[#0d141b] dark:text-white">45%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-full w-[45%] rounded-full bg-purple-500 transition-all duration-1000"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#1a2632] dark:shadow-none dark:ring-1 dark:ring-white/10">
                    <h3 className="font-bold text-[#0d141b] dark:text-white mb-4">Admin Quick Links</h3>
                    <div className="space-y-2">
                      <Link href="/dashboard/setting/security" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-[#137fec]">shield</span>
                        <span className="text-sm font-medium">RBAC & Security</span>
                      </Link>
                      <Link href="/dashboard/setting/integrations" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-purple-500">webhook</span>
                        <span className="text-sm font-medium">API & Webhooks</span>
                      </Link>
                      <Link href="/dashboard/ai-hub" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-orange-500">smart_toy</span>
                        <span className="text-sm font-medium">AI Features</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Placeholder content for other tabs */}
      {activeTab !== 'overview' && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a2632] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
             <span className="material-symbols-outlined text-3xl text-slate-400">construction</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Under Construction</h3>
          <p className="text-gray-500 dark:text-slate-400 mt-2">The {activeTab} section includes Strategy, OKRs, and People Operations.</p>
        </div>
      )}
    </div>
  );
}
