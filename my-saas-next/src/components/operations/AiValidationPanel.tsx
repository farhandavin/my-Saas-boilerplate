'use client';

import React from 'react';

export function AiValidationPanel() {
  return (
    <div className="xl:col-span-1 flex flex-col gap-6">
      {/* AI Status Card */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-[#1c2535] overflow-hidden shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20">
        {/* Animated Header Background */}
        <div className="relative h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined animate-pulse">warning</span>
              <h3 className="font-bold text-sm uppercase tracking-wide">Action Required</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 uppercase tracking-wider">AI v2.4</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Validation Failed</h2>
            <p className="text-sm text-slate-500 dark:text-[#92a4c9] mt-1">
              The AI analyzed 12 data points and found <span className="text-amber-600 dark:text-amber-400 font-bold">1 SOP violation</span> that prevents approval.
            </p>
          </div>
          {/* Progress Bar visual */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex">
            <div className="w-[85%] bg-emerald-500 h-full"></div>
            <div className="w-[15%] bg-amber-500 h-full animate-pulse"></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>85% Compliant</span>
            <span className="text-amber-500">15% Risk</span>
          </div>
        </div>
      </div>
      
      {/* Detailed Error Cards */}
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider pl-1">Issues Found (1)</h4>
        {/* Issue Card */}
        <div className="relative rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 transition-all hover:shadow-md">
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              <div className="size-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-[16px]">percent</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <div className="flex justify-between items-start">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">Excessive Discount</h5>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">High Severity</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Line item #2 has a <span className="font-bold">50% discount</span>. Standard Operating Procedure (SOP) limits discounts to <span className="font-bold">20%</span> for Consultation Services.
              </p>
              {/* AI Suggestion Box */}
              <div className="mt-3 rounded border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#135bec] dark:text-blue-300">
                  <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  <span className="text-xs font-bold uppercase">AI Suggestion</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Reduce discount to 20% or request manager approval for exception.
                </p>
                <div className="flex gap-2 mt-1">
                  <button className="flex-1 py-1.5 bg-[#135bec] hover:bg-blue-600 text-white text-xs font-medium rounded shadow-sm transition-colors">
                    Auto-Fix to 20%
                  </button>
                  <button className="px-3 py-1.5 bg-white dark:bg-[#1c2535] border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded hover:bg-slate-50 dark:hover:bg-[#2d3b55] transition-colors">
                    Request Approval
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Passing Check (Visual reassurance) */}
        <div className="rounded-lg bg-white dark:bg-[#1c2535] border border-slate-200 dark:border-slate-700 p-3 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vendor Tax ID Verified</span>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-[#1c2535] border border-slate-200 dark:border-slate-700 p-3 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency Consistency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
