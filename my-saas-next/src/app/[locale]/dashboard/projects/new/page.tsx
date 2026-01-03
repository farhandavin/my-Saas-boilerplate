
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push('/dashboard/projects');
      } else {
        alert('Failed to create project');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/projects" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
        </Link>
        <h2 className="text-2xl font-bold dark:text-white">New Project</h2>
      </div>

      <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg flex gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">verified_user</span>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Privacy Layer Active</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Project description is protected by the Privacy Layer. Sensitive information (PII) will be automatically masked upon saving.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-[#135bec] outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Website Overhaul"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
             <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-[#135bec] outline-none transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
             >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-[#135bec] outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the project goals... (PII will be masked)"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Link 
              href="/dashboard/projects"
              className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#135bec] hover:bg-[#0b4eba] text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-[#135bec]/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
