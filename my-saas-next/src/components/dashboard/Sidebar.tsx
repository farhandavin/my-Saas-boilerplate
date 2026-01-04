'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';

import { TeamSwitcher } from './TeamSwitcher';

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const t = useTranslations('Dashboard');
  const [tier, setTier] = useState<string>('FREE');
  const [role, setRole] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickCreateRef.current && !quickCreateRef.current.contains(event.target as Node)) {
        setShowQuickCreate(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  useEffect(() => {
    async function fetchTeamAndRole() {
      try {
        const res = await fetch('/api/team', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.teams && data.teams.length > 0) {
            const currentTeam = data.teams[0];
            setTier(currentTeam.tier || 'FREE');
            
            // Determine Role
            if (user && user.teamMembers) {
              const member = user.teamMembers.find((tm: any) => tm.teamId === currentTeam.id);
              if (member) {
                setRole(member.role);
              }
            }
          }
        }
      } catch (e) {}
    }
    if (user) {
        fetchTeamAndRole();
    }
  }, [user]);

  const isActive = (path: string) => pathname?.includes(path);

  const tierStyles: Record<string, string> = {
    FREE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    PRO: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    ENTERPRISE: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const isStaff = role === 'STAFF';

  return (
    <div className={`flex-none border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] hidden md:flex flex-col justify-between h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} p-4`}>
     <div className="flex flex-col gap-4">
        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm hover:shadow-md transition-all z-10"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-500">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
        
        {/* Team Switcher */}
        <TeamSwitcher isCollapsed={isCollapsed} />

        {/* Plan Status Badge - Owners & Admins Only */}
        {(role === 'OWNER' || role === 'ADMIN') && (
          <Link href="/dashboard/setting/billing" className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all mb-4 group overflow-hidden`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-500 dark:text-slate-400">workspace_premium</span>
              {!isCollapsed && <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Current Plan</span>}
            </div>
            {!isCollapsed && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${tierStyles[tier] || tierStyles.FREE}`}>
                {tier}
              </span>
            )}
          </Link>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-1">
          {/* Quick Action - High Intent */}
          <div className="mb-4 px-2 relative" ref={quickCreateRef}>
            <button 
              onClick={() => setShowQuickCreate(!showQuickCreate)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center'} gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg shadow-lg shadow-primary/25 transition-all active:scale-95 group overflow-hidden`}
            >
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
              {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap">Quick Create</span>}
            </button>

            {/* Dropdown Menu */}
            {showQuickCreate && (
              <div className={`absolute top-full mt-2 left-2 right-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-200 ${isCollapsed ? 'w-48 left-full top-0 ml-2 mt-0' : ''}`}>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-2 uppercase tracking-wider">Create New</div>
                <Link 
                  href="/dashboard/projects/new" 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors" 
                  onClick={() => setShowQuickCreate(false)}
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">rocket_launch</span>
                  Project
                </Link>
                <Link href="/dashboard/campaigns" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-primary">folder</span>
                  Campaigns
                </Link>
                <Link 
                  href="/dashboard/invoices/new" 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors" 
                  onClick={() => setShowQuickCreate(false)}
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
                  Invoice
                </Link>
                <Link 
                  href="/dashboard/teams/new" 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors" 
                  onClick={() => setShowQuickCreate(false)}
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">group_add</span>
                  Team
                </Link>
              </div>
            )}
          </div>
          <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/dashboard') && !isActive('/knowledge-base') && !isActive('/audit-logs') && !isActive('/compliance') && !isActive('/privacy-layer') && !isActive('/reports') && !isActive('/setting') && !isActive('/invoices') && !isActive('/projects') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title={isCollapsed ? t('title') : ''}>
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">{t('title')}</p>}
          </Link>
          

          <Link href="/dashboard/projects" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/projects') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title="Projects">
            <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
            {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">Projects</p>}
          </Link>

          <Link href="/dashboard/invoices" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/invoices') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title="Invoices">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">Invoices</p>}
          </Link>
          
          <Link href="/dashboard/knowledge-base" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/knowledge-base') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title="Documents (Knowledge Base)">
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
             {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">Documents</p>}
          </Link>

          <Link href="/dashboard/knowledge-base/rag" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/rag') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title="RAG Chat">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">RAG Chat</p>}
          </Link>

          {!isStaff && (
            <Link href="/dashboard/audit-logs" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/audit-logs') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title="Audit Logs">
              <span className="material-symbols-outlined text-[20px]">description</span>
              {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">Audit Logs</p>}
            </Link>
          )}

          <Link href="/dashboard/compliance" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/compliance') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title="Compliance">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
            {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">Compliance</p>}
          </Link>

          <Link href="/dashboard/privacy-layer" className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive('/privacy-layer') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} ${isCollapsed ? 'justify-center' : ''}`} title={t('title') === 'Dasbor' ? 'Lapisan Privasi' : 'Privacy Layer'}>
            <span className="material-symbols-outlined text-[20px]">shield_lock</span>
            {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">{t('title') === 'Dasbor' ? 'Lapisan Privasi' : 'Privacy Layer'}</p>}
          </Link>

          {!isStaff && (
            <Link href="/dashboard/setting" className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9] cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : ''}`} title={t('settings')}>
              <span className="material-symbols-outlined text-[20px]">settings</span>
              {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">{t('settings')}</p>}
            </Link>
          )}
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          // Dispatch a custom event to notify other components if needed
          window.dispatchEvent(new Event('auth:logout'));
          window.location.href = '/auth';
        }}
        className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9] cursor-pointer transition-colors mt-auto ${isCollapsed ? 'justify-center' : ''}`} 
        title={t('logout')}
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">{t('logout')}</p>}
      </button>
    </div>
  );
}
