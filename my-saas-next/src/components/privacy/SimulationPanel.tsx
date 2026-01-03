'use client';

import React from 'react';

export function SimulationPanel() {
  return (
    <div className="xl:col-span-5 flex flex-col gap-6">
      <div className="flex flex-col gap-4 h-full">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[#135bec]">science</span>
          Live Redaction Simulation
        </h3>
        <div className="flex-1 bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-lg">
          <div className="flex flex-col gap-2">
            <label className="text-slate-500 dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">Raw Input (Unstructured Text)</label>
            <textarea 
              className="w-full h-32 bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-lg p-3 text-sm text-slate-700 dark:text-gray-300 focus:ring-[#135bec] focus:border-[#135bec] font-mono resize-none" 
              placeholder="Paste text here to test rules..."
              defaultValue="Customer John Doe (john.doe@email.com) requested a refund for order #9921 using card 4532-1234-5678-9010. His national ID is 3175002910900001."
            />
          </div>
          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 rotate-90">arrow_forward</span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex justify-between items-center">
              <label className="text-slate-500 dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">Processed Output (To Gemini API)</label>
              <span className="text-[10px] text-emerald-500 font-mono">Latency: 12ms</span>
            </div>
            <div className="w-full h-full min-h-[140px] bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] border-l-4 border-l-[#135bec] rounded-r-lg p-4 text-sm font-mono leading-relaxed text-slate-700 dark:text-gray-400">
              Customer <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 px-1 rounded">[PERSON_NAME]</span> (<span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-200 px-1 rounded">f5a2...b91</span>) requested a refund for order #9921 using card <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 px-1 rounded">************9010</span>. His national ID is <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 px-1 rounded">[ID_REDACTED]</span>.
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-[#30363d] flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
            <p className="text-xs text-slate-500 dark:text-[#92a4c9]">AI Models will receive the processed output only. Original PII is never logged.</p>
          </div>
        </div>
        
        {/* Logs Mini Panel */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h4 className="text-slate-900 dark:text-white text-sm font-bold">Recent Privacy Events</h4>
            <a className="text-[#135bec] text-xs hover:underline" href="#">View All</a>
          </div>
          <div className="flex flex-col gap-0">
            <div className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-mono text-slate-400 dark:text-[#92a4c9] mt-1">10:42:01</span>
              <div className="flex flex-col">
                <p className="text-slate-700 dark:text-gray-300 text-xs"><span className="text-[#135bec] font-medium">Gemini Pro</span> request sanitized.</p>
                <p className="text-slate-500 dark:text-[#92a4c9] text-[10px]">3 entities masked (2 Email, 1 Phone)</p>
              </div>
            </div>
            <div className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-mono text-slate-400 dark:text-[#92a4c9] mt-1">10:41:55</span>
              <div className="flex flex-col">
                <p className="text-slate-700 dark:text-gray-300 text-xs"><span className="text-[#135bec] font-medium">GPT-4o</span> request sanitized.</p>
                <p className="text-slate-500 dark:text-[#92a4c9] text-[10px]">1 entity masked (1 Credit Card)</p>
              </div>
            </div>
            <div className="flex gap-3 py-2">
              <span className="text-[10px] font-mono text-slate-400 dark:text-[#92a4c9] mt-1">10:40:12</span>
              <div className="flex flex-col">
                <p className="text-slate-700 dark:text-gray-300 text-xs">Rule updated by <span className="text-slate-900 dark:text-white">Admin</span>.</p>
                <p className="text-slate-500 dark:text-[#92a4c9] text-[10px]">Disabled masking for "Postal Code"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
