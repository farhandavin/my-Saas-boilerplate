'use client';

import React from 'react';

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#111722] p-5 border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/40 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 material-symbols-outlined text-[20px]">rule</span>
            <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">Active Rules</p>
          </div>
          <span className="text-[#0bda5e] text-xs font-medium bg-[#0bda5e]/10 px-2 py-0.5 rounded-full">+2%</span>
        </div>
        <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">12 Defined</p>
        <div className="w-full bg-slate-100 dark:bg-[#232f48] h-1 rounded-full mt-2">
          <div className="bg-blue-500 h-1 rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#111722] p-5 border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/40 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 material-symbols-outlined text-[20px]">visibility_off</span>
            <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">PII Entities Masked (24h)</p>
          </div>
          <span className="text-[#0bda5e] text-xs font-medium bg-[#0bda5e]/10 px-2 py-0.5 rounded-full">+15%</span>
        </div>
        <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">14,205</p>
        <div className="w-full bg-slate-100 dark:bg-[#232f48] h-1 rounded-full mt-2">
          <div className="bg-purple-500 h-1 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#111722] p-5 border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/40 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-orange-500/10 text-orange-500 material-symbols-outlined text-[20px]">verified_user</span>
            <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">Compliance Score</p>
          </div>
          <span className="text-[#0bda5e] text-xs font-medium bg-[#0bda5e]/10 px-2 py-0.5 rounded-full">Optimal</span>
        </div>
        <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">98/100</p>
        <div className="w-full bg-slate-100 dark:bg-[#232f48] h-1 rounded-full mt-2">
          <div className="bg-orange-500 h-1 rounded-full" style={{ width: '98%' }}></div>
        </div>
      </div>
    </div>
  );
}
