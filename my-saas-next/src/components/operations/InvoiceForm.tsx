'use client';

import React from 'react';

export function InvoiceForm() {
  return (
    <div className="xl:col-span-2 flex flex-col gap-6">
      {/* Section: Vendor Info */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c2535] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#232f48]/50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">store</span>
            Vendor Information
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9]">Vendor Name</label>
            <div className="relative">
              <input className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111722] text-slate-900 dark:text-white px-4 focus:ring-[#135bec] focus:border-[#135bec] placeholder:text-slate-400" type="text" defaultValue="PT. Mitra Teknologi Solusi" />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-[20px]" title="Vendor Verified">check_circle</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9]">Reference Number</label>
            <input className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111722] text-slate-900 dark:text-white px-4 focus:ring-[#135bec] focus:border-[#135bec]" type="text" defaultValue="PO-99283-XJ" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9]">Invoice Date</label>
            <input className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111722] text-slate-900 dark:text-white px-4 focus:ring-[#135bec] focus:border-[#135bec]" type="date" defaultValue="2023-10-24" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9]">Due Date</label>
            <input className="w-full h-11 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111722] text-slate-900 dark:text-white px-4 focus:ring-[#135bec] focus:border-[#135bec]" type="date" defaultValue="2023-11-24" />
          </div>
        </div>
      </section>
      
      {/* Section: Line Items (The core validation area) */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c2535] overflow-hidden flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#232f48]/50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">receipt_long</span>
            Line Items
          </h3>
          <button className="text-[#135bec] text-sm font-medium hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">add</span> Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-6 text-xs font-semibold uppercase text-slate-500 dark:text-[#92a4c9] w-[40%]">Description</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500 dark:text-[#92a4c9] w-[10%]">Qty</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500 dark:text-[#92a4c9] w-[15%]">Price</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500 dark:text-[#92a4c9] w-[15%]">Discount %</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500 dark:text-[#92a4c9] w-[15%] text-right">Total</th>
                <th className="py-3 px-4 w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 dark:text-white divide-y divide-slate-200 dark:divide-slate-700">
              {/* Valid Row */}
              <tr className="group hover:bg-slate-50 dark:hover:bg-[#232f48]/30">
                <td className="py-3 px-6">
                  <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-900 dark:text-white font-medium placeholder-slate-400" type="text" defaultValue="Server Maintenance (Oct)" />
                </td>
                <td className="py-3 px-4">
                  <input className="w-full bg-slate-100 dark:bg-[#111722] border-transparent rounded px-2 py-1 text-center focus:ring-[#135bec] focus:border-[#135bec]" type="number" defaultValue="1" />
                </td>
                <td className="py-3 px-4">
                  <input className="w-full bg-slate-100 dark:bg-[#111722] border-transparent rounded px-2 py-1 text-right focus:ring-[#135bec] focus:border-[#135bec]" type="number" defaultValue="500.00" />
                </td>
                <td className="py-3 px-4">
                  <input className="w-full bg-slate-100 dark:bg-[#111722] border-transparent rounded px-2 py-1 text-center focus:ring-[#135bec] focus:border-[#135bec]" type="number" defaultValue="0" />
                </td>
                <td className="py-3 px-4 text-right font-medium">$500.00</td>
                <td className="py-3 px-4 text-center">
                  <button className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </td>
              </tr>
              {/* Invalid Row (The 50% discount error) */}
              <tr className="bg-amber-50/50 dark:bg-amber-900/10 group">
                <td className="py-3 px-6">
                  <div className="flex flex-col">
                    <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-900 dark:text-white font-medium" type="text" defaultValue="Strategic Consultation Fee" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span> Check SOP Rule #402
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <input className="w-full bg-white dark:bg-[#111722] border border-amber-200 dark:border-amber-800 rounded px-2 py-1 text-center focus:ring-amber-500 focus:border-amber-500" type="number" defaultValue="10" />
                </td>
                <td className="py-3 px-4">
                  <input className="w-full bg-white dark:bg-[#111722] border border-amber-200 dark:border-amber-800 rounded px-2 py-1 text-right focus:ring-amber-500 focus:border-amber-500" type="number" defaultValue="100.00" />
                </td>
                <td className="py-3 px-4 relative">
                  {/* ERROR HIGHLIGHT */}
                  <div className="relative">
                    <input className="w-full bg-amber-100 dark:bg-amber-900/40 border border-amber-500 text-amber-900 dark:text-amber-200 font-bold rounded px-2 py-1 text-center focus:ring-amber-500 focus:border-amber-500" type="number" defaultValue="50" />
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-1.5 rounded-full font-bold shadow-sm">!</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium text-amber-700 dark:text-amber-400">$500.00</td>
                <td className="py-3 px-4 text-center">
                  <button className="text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#232f48]/30">
              <tr>
                <td className="py-4 px-6 text-right text-sm font-medium text-slate-500 dark:text-[#92a4c9]" colSpan={4}>Subtotal</td>
                <td className="py-4 px-4 text-right text-sm font-bold text-slate-900 dark:text-white">$1,000.00</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
