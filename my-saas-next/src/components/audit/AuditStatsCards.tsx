'use client';

import React from 'react';

interface AuditStats {
  totalEvents: number;
  todayEvents: number;
}

interface AuditStatsCardsProps {
  stats?: AuditStats;
}

export function AuditStatsCards({ stats }: AuditStatsCardsProps) {
  const defaultStats: AuditStats = {
    totalEvents: 0,
    todayEvents: 0,
  };
  
  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Total Events */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#232f48]/10 p-5 hover:border-[#135bec] transition-colors group">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#135bec]/10 text-[#135bec]">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-slate-500 dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">Total Events</p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
            {data.totalEvents.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Today's Events */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#232f48]/10 p-5 hover:border-[#135bec] transition-colors group">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <span className="material-symbols-outlined text-[20px]">today</span>
          </div>
          <span className="text-blue-500 text-xs font-semibold bg-blue-500/10 px-2 py-1 rounded-md">Today</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-slate-500 dark:text-[#92a4c9] text-xs font-medium uppercase tracking-wider">Today's Events</p>
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
            {data.todayEvents.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
