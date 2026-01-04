'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AuditStatsCards } from '@/components/audit/AuditStatsCards';
import { AuditLogTable } from '@/components/audit/AuditLogTable';
import { getErrorMessage } from '@/lib/error-utils';


interface AuditLog {
  id: string;
  action: string;
  resource: string | null;
  details: string | null;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
}

interface AuditStats {
  totalEvents: number;
  todayEvents: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAuditLogs = useCallback(async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }

      setLogs(data.logs);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs(currentPage, searchQuery);
  }, [currentPage, fetchAuditLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuditLogs(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("No logs to export.");
      return;
    }

    const headers = ["TimeStamp", "Actor", "Action", "Details", "IP Address"];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.userName || log.userEmail || 'System',
      log.action,
      log.details || '-',
      log.ipAddress || '-'
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetentionPolicy = () => {
    alert("Standard Retention Policy: 90 Days.\n\nTo change this to 365 days or custom retention, please upgrade to Enterprise Plan.");
  };

  return (
    <div className="mx-auto max-w-[1400px] flex flex-col gap-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <Link className="text-slate-500 dark:text-[#92a4c9] hover:text-[#135bec] transition-colors font-medium" href="/dashboard">Home</Link>
        <span className="text-slate-500 dark:text-[#92a4c9] font-medium">/</span>
        <span className="text-slate-500 dark:text-[#92a4c9] hover:text-[#135bec] transition-colors font-medium">System Administration</span>
        <span className="text-slate-500 dark:text-[#92a4c9] font-medium">/</span>
        <span className="text-[#135bec] font-medium">Audit Logs</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Activity Audit Logs</h1>
          <p className="text-slate-500 dark:text-[#92a4c9] text-base font-normal max-w-2xl">
              Real-time ledger of system modifications, access events, and digital footprints across the Enterprise OS infrastructure.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRetentionPolicy} className="flex h-10 px-4 items-center justify-center rounded-lg bg-white dark:bg-[#232f48] text-slate-700 dark:text-white text-sm font-bold border border-slate-200 dark:border-slate-700 hover:border-[#135bec] transition-all gap-2">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Retention Policy</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex h-10 px-4 items-center justify-center rounded-lg bg-[#135bec] text-white text-sm font-bold shadow-lg shadow-[#135bec]/20 hover:bg-[#135bec]/90 transition-all gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <AuditStatsCards stats={stats || undefined} />

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#232f48]/20 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input 
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-slate-700 focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all" 
            placeholder="Search by Actor, IP, Resource ID, or Action..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Filters */}
        {/* Filters - Removed mock buttons (Date Range, All Modules, Severity) as they are not wired to backend yet */}

        {/* AI Action */}
        <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg whitespace-nowrap hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span>Search</span>
        </button>
      </form>

      {/* Data Table */}
      <AuditLogTable 
        logs={logs} 
        isLoading={isLoading}
        pagination={pagination || undefined}
        onPageChange={handlePageChange}
      />
      
      <div className="h-10"></div>
    </div>
  );
}
