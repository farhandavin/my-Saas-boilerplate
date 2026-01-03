'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/components/Toast';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { showError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentRole, setCurrentRole] = useState<string>('STAFF');

  useEffect(() => {
    fetchProjects();
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const res = await axios.get('/api/team');
      const teams = res.data.teams;
      const currentTeamId = localStorage.getItem('currentTeamId');
      const activeTeam = teams.find((t: any) => t.id === currentTeamId) || teams[0];
      if (activeTeam?.myRole) {
         setCurrentRole(activeTeam.myRole);
      }
    } catch (err) {
      console.error('Failed to fetch role', err);
    }
  };

  const fetchProjects = async () => {
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        // headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (err) {
      showError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your projects, track tasks, and collaborate with your team.
          </p>
        </div>

        {['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole) && (
          <Link 
            href="/dashboard/projects/new"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search for a project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded decoration-0">⌘ K</kbd>
          </div>
        </div>
        
        <button className="p-2 bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
        </button>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse ring-1 ring-slate-200 dark:ring-slate-800"></div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Link 
              key={project.id} 
              href={`/dashboard/projects/${project.id}`}
              className="group relative flex flex-col justify-between p-5 bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl transition-all hover:shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            {project.name.substring(0, 2).toUpperCase()}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                            {project.name}
                        </h3>
                    </div>
                    {project.status === 'active' ? (
                         <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full uppercase tracking-wider">
                            Active
                         </span>
                    ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-full uppercase tracking-wider">
                            {project.status}
                        </span>
                    )}
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px]">
                  {project.description || 'No description provided.'}
                </p>
              </div>

               <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                       {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Project</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </div>
               </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-symbols-outlined text-3xl text-slate-400">rocket_launch</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No projects yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                Get started by creating your first project to track tasks and collaborate with your team.
            </p>
            {['OWNER', 'ADMIN', 'MANAGER'].includes(currentRole) && (
              <Link 
                  href="/dashboard/projects/new"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Create Project
              </Link>
            )}
        </div>
      )}
    </div>
  );
}
