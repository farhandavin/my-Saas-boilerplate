'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Role } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Team {
  id: string;
  name: string;
  slug: string;
  myRole: Role;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [userName, setUserName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const token = localStorage.getItem('token');
        // if (!token) return;

        const [userRes, teamRes] = await Promise.all([
          fetch('/api/auth/me', { /* headers: { 'Authorization': `Bearer ${token}` } */ }),
          fetch('/api/team', { /* headers: { 'Authorization': `Bearer ${token}` } */ })
        ]);

        if (userRes.ok) {
           const userData = (await userRes.json()).user;
           setUser(userData);
           setUserName(userData.name);
        }
        
        if (teamRes.ok) {
           const teams = (await teamRes.json()).teams;
           if (teams?.length) {
             setTeam(teams[0]);
             setTeamName(teams[0].name);
           }
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!userName.trim()) return;
    setSavingUser(true);
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: userName })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating profile');
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!team || !teamName.trim()) return;
    setSavingTeam(true);
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch(`/api/team/${team.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: teamName })
      });

      if (res.ok) {
        const data = await res.json();
        setTeam(prev => prev ? { ...prev, name: data.team.name } : null);
        toast.success('Team updated successfully');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update team');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating team');
    } finally {
      setSavingTeam(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 dark:text-slate-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

      {/* 1. Personal Profile */}
      <div className="bg-white dark:bg-[#111722] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Personal Profile</h2>
        <div className="flex gap-6 items-center mb-6">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <div className="grid gap-4 max-w-md">
           <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={userName}
                 onChange={(e) => setUserName(e.target.value)}
                 className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
               />
               <button 
                 onClick={handleUpdateProfile}
                 disabled={savingUser || userName === user?.name}
                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
               >
                 {savingUser ? 'Saving...' : 'Save'}
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* 2. Company/Team Profile */}
      <div className="bg-white dark:bg-[#111722] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Company Profile</h2>
           <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">ID: {team?.slug}</span>
        </div>
        
        <div className="grid gap-4 max-w-md mb-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={teamName} 
                 onChange={(e) => setTeamName(e.target.value)}
                 className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60" 
                 disabled={team?.myRole === 'STAFF'} 
               />
               {team?.myRole !== 'STAFF' && (
                 <button 
                   onClick={handleUpdateTeam}
                   disabled={savingTeam || teamName === team?.name}
                   className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                 >
                   {savingTeam ? 'Saving...' : 'Save'}
                 </button>
               )}
             </div>
             {team?.myRole === 'STAFF' && <p className="text-xs text-slate-500 mt-1">Only Owners and Admins can update company details.</p>}
           </div>
        </div>

        {/* Link to Team Management if Admin/Owner */}
        {['ADMIN', 'MANAGER', 'OWNER'].includes(team?.myRole || '') && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link href="/dashboard/setting/team" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
               Manage Team Members & Permissions <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>

      {((team?.myRole as string) === 'OWNER' || (team?.myRole as string) === 'ADMIN') && (
      <>
      <div className="bg-white dark:bg-[#111722] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Security & Integrations</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent dark:border-slate-700">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">API Keys</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage programatic access to your workspace</p>
            </div>
            <Link href="/dashboard/setting/api-keys" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
              Manage Keys
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent dark:border-slate-700">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">Webhooks</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Receive real-time event notifications</p>
            </div>
            <Link href="/dashboard/setting/webhooks" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
              Configure
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                Data Isolation
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded">ENTERPRISE</span>
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Configure dedicated database for your workspace</p>
            </div>
            <Link href="/dashboard/setting/tenancy" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              Configure
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#111722] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">White Labeling</h2>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                Custom Branding
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">PRO</span>
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customize logo, colors, and domain.</p>
            </div>
            <Link href="/dashboard/setting/branding" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Customize
            </Link>
          </div>
          
          <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent dark:border-slate-700">
             <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Email Server (SMTP)</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure custom outgoing email server.</p>
             </div>
             <Link href="/dashboard/setting/smtp" className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
               Configure
             </Link>
          </div>
      </div>
      </>
      )}
    </div>
  );
}
