'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  // Data State
  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  // Filter State
  const [search, setSearch] = useState('');

  // Fetch Data
  const fetchData = useCallback(async (page = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/documents`, {
        params: { page, pageSize: 10, search: searchQuery }
      });
      setData(res.data.data);
      setMetadata(res.data.metadata);
    } catch (err) {
      console.error(err);
      showError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Columns Configuration
  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <Link 
          href={`/dashboard/knowledge-base/${row.original.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          {row.getValue('title')}
        </Link>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-gray-500">
          {format(new Date(row.getValue('createdAt')), 'MMM d, yyyy HH:mm')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Status',
      cell: () => (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
          Indexed
        </span>
      )
    }
  ];

  // Quick Upload State
  const [uploading, setUploading] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');

  const handleQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle || !quickContent) return;

    try {
      setUploading(true);
      await axios.post('/api/documents', {
        title: quickTitle,
        content: quickContent
      });
      showSuccess('Document created successfully');
      setQuickTitle('');
      setQuickContent('');
      fetchData(1, search); // Refresh
    } catch (err: any) {
      showError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Role Fetching
  const [currentRole, setCurrentRole] = useState<string>('STAFF');
  useEffect(() => {
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
    fetchRole();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage internal documents for your AI context.</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Debounce could be added here
              if (e.target.value.length === 0 || e.target.value.length > 2) {
                 fetchData(1, e.target.value);
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Data Table */}
        <div className={['ADMIN', 'MANAGER'].includes(currentRole) ? "lg:col-span-2" : "lg:col-span-3"}>
           <DataTable 
             columns={columns} 
             data={data} 
             isLoading={loading}
             pagination={{
               currentPage: metadata.currentPage,
               totalPages: metadata.totalPages,
               onPageChange: (page) => fetchData(page, search)
             }}
           />
        </div>

        {/* Sidebar: Quick Add - Only for Admin/Manager */}
        {['ADMIN', 'MANAGER'].includes(currentRole) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 h-fit shadow-sm sticky top-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Add New Document
            </h3>
            
            <form onSubmit={handleQuickUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Company Policy 2024"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Content</label>
                <textarea 
                  rows={6}
                  placeholder="Paste the document content here..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={quickContent}
                  onChange={e => setQuickContent(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {quickContent.length} characters
                </p>
              </div>

              <button 
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Indexing...
                  </>
                ) : (
                  'Add to Knowledge Base'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}