'use client';

import React from 'react';

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

interface AuditLogTableProps {
  logs?: AuditLog[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export function AuditLogTable({ logs = [], isLoading = false, pagination, onPageChange }: AuditLogTableProps) {
  const getActionBadgeColor = (action: string) => {
    const upperAction = action.toUpperCase();
    if (upperAction.includes('DELETE') || upperAction.includes('REVOKE')) {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20';
    }
    if (upperAction.includes('UPDATE') || upperAction.includes('EDIT')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20';
    }
    if (upperAction.includes('CREATE') || upperAction.includes('INSERT')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20';
    }
    if (upperAction.includes('AI') || upperAction.includes('SYNC')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-500/20';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'SYS';
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#232f48]/10 p-8">
        <div className="flex items-center justify-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[#135bec]">progress_activity</span>
          <span className="text-slate-500 dark:text-[#92a4c9]">Loading audit logs...</span>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#232f48]/10 p-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600">receipt_long</span>
          <p className="text-slate-500 dark:text-[#92a4c9]">No audit logs found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">Events will appear here when actions occur in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#232f48]/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#232f48]/50 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider w-1/6">When</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider w-1/5">Who</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider w-1/6">What</th>
              <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider w-1/3">Context</th>
              <th className="hidden"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#232f48]/30 transition-colors group cursor-default">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex flex-col group/date">
                    <span className="text-slate-900 dark:text-white text-sm font-medium">{formatDate(log.createdAt)}</span>
                    <span className="text-slate-400 text-xs opacity-0 group-hover:opacity-100 group-hover/date:opacity-100 transition-opacity">
                      IP: {log.ipAddress || 'Internal'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-cover bg-center bg-[#135bec]/10 flex items-center justify-center text-[#135bec] font-bold text-xs ring-2 ring-white dark:ring-[#232f48]">
                      {getInitials(log.userName, log.userEmail)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white text-sm font-semibold">{log.userName || 'Unknown User'}</span>
                      <span className="text-slate-500 dark:text-[#92a4c9] text-xs">{log.userEmail || 'System'}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getActionBadgeColor(log.action)}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{log.resource || 'System Event'}</span>
                     <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{log.details || 'No additional context provided'}</p>
                  </div>
                </td>
                <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-slate-400 hover:text-[#135bec] p-2 rounded hover:bg-slate-100 dark:hover:bg-[#232f48] transition-colors" title="View Details">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#232f48]/20 px-4 py-3 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-[#92a4c9]">
                Showing <span className="font-medium text-slate-900 dark:text-white">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium text-slate-900 dark:text-white">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span> of{' '}
                <span className="font-medium text-slate-900 dark:text-white">{pagination.total.toLocaleString()}</span> results
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded bg-white dark:bg-[#111722] border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-[#1c2535] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 rounded bg-white dark:bg-[#111722] border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-[#1c2535] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
