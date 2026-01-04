'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { ActivityLog } from '@/components/audit/ActivityLog';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  logs?: any[]; 
}

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams(); // { id }
  const { showSuccess, showError } = useToast();

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'activity'>('view');
  
  // Edit State
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  // Fetch Doc
  const fetchDoc = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch with logs
      const res = await axios.get(`/api/documents/${params.id}?includeLogs=true`);
      setDoc(res.data);
      setEditForm({ title: res.data.title, content: res.data.content });
    } catch (err) {
      console.error(err);
      showError('Failed to load document');
      router.push('/dashboard/knowledge-base');
    } finally {
      setLoading(false);
    }
  }, [params.id, router, showError]);

  useEffect(() => {
    if (params.id) fetchDoc();
  }, [fetchDoc, params.id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`/api/documents/${params.id}`, editForm);
      showSuccess('Document updated successfully');
      fetchDoc(); // Refresh to get new logs and updated data
      setActiveTab('view');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Update failed';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This action implies audit logging.')) return;
    try {
      await axios.delete(`/api/documents/${params.id}`);
      showSuccess('Document deleted');
      router.push('/dashboard/knowledge-base');
    } catch (err) {
      showError('Delete failed');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading document...</div>;
  }

  if (!doc) return null;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex text-sm text-gray-500 mb-2">
            <Link href="/dashboard/knowledge-base" className="hover:text-indigo-600 transition-colors">Documents</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{doc.title}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-indigo-600">article</span>
            {doc.title}
          </h1>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={handleDelete}
             className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-200"
           >
             Delete
           </button>
           {activeTab === 'view' ? (
              <button 
                onClick={() => setActiveTab('edit')}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                Edit
              </button>
           ) : activeTab === 'edit' ? (
             <div className="flex gap-2">
               <button 
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
               <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
             </div>
           ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('view')}
            className={`${activeTab === 'view' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            View
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`${activeTab === 'edit' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            Edit
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`${activeTab === 'activity' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
             <span className="material-symbols-outlined text-[18px]">history</span>
             Activity Log
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 min-h-[400px]">
        
        {activeTab === 'view' && (
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold mb-4">{doc.title}</h2>
            <div className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">
              {doc.content}
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={editForm.title}
                onChange={e => setEditForm({...editForm, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <textarea
                rows={15}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                value={editForm.content}
                onChange={e => setEditForm({...editForm, content: e.target.value})}
              />
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Audit Trail</h3>
            <ActivityLog logs={doc.logs || []} />
          </div>
        )}

      </div>
    </div>
  );
}
