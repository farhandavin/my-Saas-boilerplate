'use client';

import { useState, useRef, useEffect } from 'react';
import { useTeam } from '@/context/TeamContext';
import Link from 'next/link';

export function TeamSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
    const { currentTeam, refreshTeam } = useTeam();
    const [isOpen, setIsOpen] = useState(false);
    const [teams, setTeams] = useState<any[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch('/api/team');
                if (res.ok) {
                    const data = await res.json();
                    setTeams(data.teams);
                }
            } catch (error) {
                console.error('Failed to fetch teams', error);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchTeam = (teamId: string) => {
        localStorage.setItem('currentTeamId', teamId);
        // Force a hard refresh to ensure all contexts update and we fetch new team data
        window.location.href = '/dashboard/projects';
    };

    if (!currentTeam) return null;

    return (
        <div className="relative mb-6" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            >
                {/* Team Logo / Avatar */}
                <div className="relative flex-none">
                     {currentTeam.branding?.logoUrl ? (
                        <img 
                            src={currentTeam.branding.logoUrl} 
                            alt={currentTeam.name} 
                            className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-700"
                        />
                     ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {currentTeam.name.substring(0, 1).toUpperCase()}
                        </div>
                     )}
                     <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#111722] rounded-full p-0.5">
                        <span className="material-symbols-outlined text-[12px] text-slate-500">expand_more</span>
                     </div>
                </div>

                {!isCollapsed && (
                    <div className="flex-1 text-left overflow-hidden">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentTeam.name}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{currentTeam.myRole} Workspace</p>
                    </div>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute top-full mt-2 left-0 w-64 bg-white dark:bg-[#192233] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 ${isCollapsed ? 'left-14' : ''}`}>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-2 uppercase tracking-wider mb-1">Switch Team</div>
                    
                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                        {teams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => handleSwitchTeam(team.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    currentTeam.id === team.id 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                    currentTeam.id === team.id ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-slate-200 dark:bg-slate-700'
                                }`}>
                                    {team.name.substring(0, 1).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium truncate">{team.name}</span>
                                {currentTeam.id === team.id && (
                                    <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                    <Link 
                        href="/dashboard/teams/new"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors group"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-6 h-6 rounded border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                        </div>
                        <span className="text-sm font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Create New Team</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
