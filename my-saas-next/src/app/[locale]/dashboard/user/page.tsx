'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

// ... (interfaces)
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  details: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  } | null;
}

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

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      // Parallel fetch for user/team and audit logs
      const [authRes, logsRes] = await Promise.all([
        fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/audit-logs/recent', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!authRes.ok) {
        localStorage.removeItem('token');
        router.push('/auth');
        return;
      }

      const authData = await authRes.json();
      setUser(authData.user);
      setTeams(authData.teams);
      setActiveTeam(authData.activeTeam);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setActivityLogs(logsData.logs || []);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} is coming soon!`);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Helper to format time ago
  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-[#101922] text-[#0d141b] dark:text-slate-100">
      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-30 w-72 flex flex-col bg-white dark:bg-[#111a22] border-r border-[#e7edf3] dark:border-slate-800 h-full flex-shrink-0 transition-transform duration-300`}>
        <div className="flex flex-col h-full p-4">
          {/* Branding */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#137fec] text-white">
              <span className="material-symbols-outlined text-2xl">layers</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-none tracking-tight">BOS Kit</h1>
              <p className="text-[#4c739a] text-xs font-medium mt-1">Enterprise Edition</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1">
            <Link href="/dashboard/user" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#137fec]/10 text-[#137fec] dark:text-blue-400 group">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm font-bold">Dashboard</span>
            </Link>
            <Link href="/dashboard/projects" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#e7edf3] dark:hover:bg-slate-800 text-[#0d141b] dark:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[#4c739a]">work</span>
              <span className="text-sm font-medium">Projects</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#e7edf3] dark:hover:bg-slate-800 text-[#0d141b] dark:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[#4c739a]">group</span>
              <span className="text-sm font-medium">Team</span>
            </Link>
            <Link href="/dashboard/knowledge-base" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#e7edf3] dark:hover:bg-slate-800 text-[#0d141b] dark:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[#4c739a]">folder_open</span>
              <span className="text-sm font-medium">Documents</span>
            </Link>
            {/* Reports Link Removed/Hidden for now as per plan */}
            {/* 
            <Link href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#e7edf3] dark:hover:bg-slate-800 text-[#0d141b] dark:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[#4c739a]">analytics</span>
              <span className="text-sm font-medium">Reports</span>
            </Link>
            */}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto pt-4 border-t border-[#e7edf3] dark:border-slate-800 flex flex-col gap-2">
            <Link href="/dashboard/setting" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#e7edf3] dark:hover:bg-slate-800 text-[#0d141b] dark:text-slate-300 transition-colors">
              <span className="material-symbols-outlined text-[#4c739a]">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-[#f0f4f8] dark:bg-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#137fec] to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate dark:text-white">{user?.name || 'User'}</span>
                <span className="text-xs text-[#4c739a] truncate">General User</span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start px-3 py-2 text-[#4c739a] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-2"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#101922] relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 py-3 bg-white dark:bg-[#111a22] border-b border-[#e7edf3] dark:border-slate-800 sticky top-0 z-20">
          {/* Left: Mobile Menu & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden p-2 text-[#0d141b] dark:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative hidden sm:flex w-full max-w-md items-center h-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#4c739a]">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="w-full h-full pl-10 pr-4 rounded-lg bg-[#f0f4f8] dark:bg-slate-800 border-none text-sm text-[#0d141b] dark:text-white placeholder-[#4c739a] focus:ring-2 focus:ring-[#137fec]/50"
                placeholder="Search dashboard..."
                type="text"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <a className="text-sm font-medium text-[#4c739a] hover:text-[#137fec] hidden sm:block" href="#">Help</a>
            <button className="relative p-2 rounded-full hover:bg-[#f0f4f8] dark:hover:bg-slate-800 text-[#0d141b] dark:text-white transition-colors">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#111a22]"></span>
            </button>
            <Button onClick={() => router.push('/dashboard/projects/new')} className="gap-2 bg-[#137fec] hover:bg-blue-600 text-white">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 md:px-12 scroll-smooth">
          <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
            {/* Welcome & Stats */}
            <section>
              <h1 className="text-[#0d141b] dark:text-white text-3xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
              <p className="text-[#4c739a] text-sm mb-6">Here&apos;s what&apos;s happening with your projects today.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stat Card 1 */}
                <Card className="flex flex-col border-[#e7edf3] dark:border-slate-800 dark:bg-[#111a22]">
                  <CardHeader className="p-5 pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[#4c739a] text-sm font-medium">Open Tasks</p>
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#137fec]">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-[#0d141b] dark:text-white text-3xl font-bold">5</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      <span>2 new today</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Stat Card 2 */}
                <Card className="flex flex-col border-[#e7edf3] dark:border-slate-800 dark:bg-[#111a22]">
                  <CardHeader className="p-5 pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[#4c739a] text-sm font-medium">Upcoming Deadlines</p>
                      <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-[#0d141b] dark:text-white text-3xl font-bold">2</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 font-medium">
                      <span className="material-symbols-outlined text-[16px]">priority_high</span>
                      <span>Due within 24h</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Stat Card 3 */}
                <Card className="flex flex-col border-[#e7edf3] dark:border-slate-800 dark:bg-[#111a22]">
                   <CardHeader className="p-5 pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[#4c739a] text-sm font-medium">Unread Messages</p>
                      <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-[#0d141b] dark:text-white text-3xl font-bold">0</p>
                    <div className="mt-2 text-xs text-[#4c739a]">All caught up!</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-[#0d141b] dark:text-white text-lg font-bold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard/projects/new')} className="gap-2 h-auto py-3 bg-white dark:bg-[#111a22] hover:bg-[#f8fafc] group">
                  <span className="material-symbols-outlined text-[#137fec] group-hover:scale-110 transition-transform">add_task</span>
                  <span className="text-sm font-semibold text-[#0d141b] dark:text-white">New Task</span>
                </Button>
                <Button variant="outline" onClick={() => handleComingSoon('Log Hours')} className="gap-2 h-auto py-3 bg-white dark:bg-[#111a22] hover:bg-[#f8fafc] group">
                  <span className="material-symbols-outlined text-green-500 group-hover:scale-110 transition-transform">timer</span>
                  <span className="text-sm font-semibold text-[#0d141b] dark:text-white">Log Hours</span>
                </Button>
                <Button variant="outline" onClick={() => handleComingSoon('Submit Expense')} className="gap-2 h-auto py-3 bg-white dark:bg-[#111a22] hover:bg-[#f8fafc] group">
                  <span className="material-symbols-outlined text-purple-500 group-hover:scale-110 transition-transform">receipt_long</span>
                  <span className="text-sm font-semibold text-[#0d141b] dark:text-white">Submit Expense</span>
                </Button>
                <Button variant="outline" onClick={() => handleComingSoon('Schedule Meeting')} className="gap-2 h-auto py-3 bg-white dark:bg-[#111a22] hover:bg-[#f8fafc] group">
                  <span className="material-symbols-outlined text-orange-500 group-hover:scale-110 transition-transform">calendar_month</span>
                  <span className="text-sm font-semibold text-[#0d141b] dark:text-white">Schedule Meeting</span>
                </Button>
              </div>
            </section>

            {/* 3-Pillar Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pillar 1: Operations */}
              <div className="flex flex-col bg-white dark:bg-[#111a22] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e7edf3] dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#16202a]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#137fec] text-sm">settings_suggest</span>
                    <h3 className="text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider">Operations</h3>
                  </div>
                  <Link href="/dashboard/projects" className="text-[#137fec] text-xs font-bold hover:underline">View All</Link>
                </div>
                {/* Static Placeholder Data */}
                <div className="p-0">
                  <div className="flex items-center justify-between p-4 border-b border-[#f0f4f8] dark:border-slate-800 hover:bg-[#f8fafc] dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[#0d141b] dark:text-white">Q3 Planning</span>
                      <span className="text-xs text-[#4c739a]">Strategy Dept</span>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-[#f0f4f8] dark:border-slate-800 hover:bg-[#f8fafc] dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[#0d141b] dark:text-white">Website Redesign</span>
                      <span className="text-xs text-[#4c739a]">Marketing</span>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 text-xs font-bold">Pending</span>
                  </div>
                  <div className="flex items-center justify-between p-4 hover:bg-[#f8fafc] dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[#0d141b] dark:text-white">Client Onboarding</span>
                      <span className="text-xs text-[#4c739a]">Sales</span>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">Review</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Finance */}
              <div className="flex flex-col bg-white dark:bg-[#111a22] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e7edf3] dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#16202a]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500 text-sm">payments</span>
                    <h3 className="text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider">Finance</h3>
                  </div>
                  <Link href="/dashboard/invoices" className="text-[#137fec] text-xs font-bold hover:underline">Manage</Link>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#4c739a] font-medium">Monthly Budget Used</span>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-bold text-[#0d141b] dark:text-white">$1,240</span>
                      <span className="text-xs text-[#4c739a] mb-1">of $2,000</span>
                    </div>
                    <div className="w-full bg-[#e7edf3] dark:bg-slate-700 rounded-full h-2 mt-1">
                      <div className="bg-[#137fec] h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#f0f4f8] dark:border-slate-800">
                    <p className="text-xs font-bold text-[#4c739a] mb-3 uppercase">Recent</p>
                    {/* Placeholder Logic */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-slate-300">flight</span>
                        </div>
                        <span className="text-sm text-[#0d141b] dark:text-slate-300">Travel NYC</span>
                      </div>
                      <span className="text-sm font-bold text-[#0d141b] dark:text-white">-$450.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-slate-300">restaurant</span>
                        </div>
                        <span className="text-sm text-[#0d141b] dark:text-slate-300">Team Lunch</span>
                      </div>
                      <span className="text-sm font-bold text-[#0d141b] dark:text-white">-$128.50</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Team */}
              <div className="flex flex-col bg-white dark:bg-[#111a22] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e7edf3] dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#16202a]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-sm">groups</span>
                    <h3 className="text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider">Team</h3>
                  </div>
                  <Link href="/dashboard/setting" className="text-[#137fec] text-xs font-bold hover:underline">Manage</Link>
                </div>
                <div className="p-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#137fec] mt-0.5">campaign</span>
                      <div>
                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">Town Hall Tomorrow</p>
                        <p className="text-xs text-[#4c739a] mt-1">Join us at 10:00 AM for the quarterly all-hands meeting.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#4c739a] mb-3 uppercase">Who&apos;s Away</p>
                    <div className="flex -space-x-2 overflow-hidden mb-3">
                      <div className="inline-block w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#111a22] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">M</div>
                      <div className="inline-block w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#111a22] bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">J</div>
                      <div className="inline-block w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#111a22] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">+1</div>
                    </div>
                    <p className="text-xs text-[#4c739a]">Mike, Jessica and 1 other are out today.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Activity Feed */}
            <section className="bg-white dark:bg-[#111a22] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#0d141b] dark:text-white text-lg font-bold">Latest Activity</h2>
                <Link href="/dashboard/audit-logs" className="text-sm text-[#4c739a] hover:text-[#137fec]">View all history</Link>
              </div>
              <div className="space-y-4">
                {activityLogs.length === 0 ? (
                  <EmptyState
                    title="No Activity Yet"
                    description="When you or your team performs actions, they will appear here."
                    icon={<span className="material-symbols-outlined text-4xl text-slate-400">history</span>}
                  />
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="relative mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#137fec] z-10 relative"></div>
                        <div className="w-px bg-[#e7edf3] dark:bg-slate-800 absolute top-2 left-1 h-full"></div>
                      </div>
                      <div className="pb-2">
                        <p className="text-sm text-[#0d141b] dark:text-white">
                          <span className="font-bold">{log.user?.name || 'Unknown User'}</span>{' '}
                           {log.action.toLowerCase()}d <span className="font-medium text-[#137fec] cursor-pointer">{log.entity}</span>
                        </p>
                        <p className="text-xs text-[#4c739a] mt-1">{timeAgo(log.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
