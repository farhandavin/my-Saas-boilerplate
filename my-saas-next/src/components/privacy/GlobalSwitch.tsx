'use client';

import React from 'react';

export function GlobalSwitch() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-[#135bec]/20 flex items-center justify-center text-[#135bec]">
          <span className="material-symbols-outlined text-[28px]">security</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">Global Masking Engine</p>
          <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-normal">Master switch. Disabling this sends raw data to external providers (Gemini/OpenAI).</p>
        </div>
      </div>
      <label className="relative flex h-[32px] w-[56px] cursor-pointer items-center rounded-full border-2 border-transparent bg-[#232f48] transition-colors has-[:checked]:bg-[#135bec]">
        <input defaultChecked className="peer sr-only" type="checkbox" />
        <span className="absolute left-1 h-6 w-6 rounded-full bg-white transition-all peer-checked:left-[28px] shadow-sm"></span>
      </label>
    </div>
  );
}
