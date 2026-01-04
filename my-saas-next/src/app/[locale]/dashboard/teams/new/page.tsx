
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function CreateTeamPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        showSuccess('Team created successfully!');
        // Update local storage context to the new team immediately?
        // Usually better to let the user switch or redirect to settings.
        // For smoother UX, let's switch context.
        localStorage.setItem('currentTeamId', data.team.id);
        
        router.push('/dashboard/setting/team');
      } else {
        showError(data.error || 'Failed to create team');
      }
    } catch (e: any) {
      console.error(e);
      showError(e.message || 'Error creating team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
        </Link>
        <h2 className="text-2xl font-bold dark:text-white">Create New Team</h2>
      </div>

      <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-lg flex gap-3">
          <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">group_add</span>
          <div>
            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Team Workspace</h4>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
              Teams allow you to collaborate with others, manage billing separately, and organize projects.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Team Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-[#135bec] outline-none transition-all"
              value={formData.name}
              onChange={e => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                  setFormData({ name, slug });
              }}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Team Slug (Unique ID)</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-[#135bec] outline-none transition-all"
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              placeholder="e.g. acme-corp"
            />
            <p className="text-xs text-slate-500 mt-1">Used in URLs and API limits.</p>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Link 
              href="/dashboard"
              className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#135bec] hover:bg-[#0b4eba] text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-[#135bec]/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
