"use client";

import { useState } from "react";
import { Skeleton, CardSkeleton, TableSkeleton, ChartSkeleton, AIChatSkeleton, BriefingSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "next-themes";

export default function UITestPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  return (
    <div className="p-8 space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">UI Component Verification</h1>
          <p className="text-slate-500 dark:text-slate-400">Testing ground for new premium UI/UX features.</p>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Toggle Theme ({theme})
        </button>
      </div>

      {/* Skeletons Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Premium Shimmer Skeletons</h2>
          <button 
            onClick={() => setLoading(!loading)} 
            className="text-sm text-indigo-600 font-medium"
          >
            Toggle Loading State
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500">Card Skeleton</h3>
            <CardSkeleton />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500">Briefing Skeleton (Gradient)</h3>
            <BriefingSkeleton />
          </div>
          <div className="space-y-4 md:col-span-2">
             <h3 className="text-sm font-medium text-slate-500">Table Skeleton</h3>
             <TableSkeleton rows={3} />
          </div>
           <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500">Chart Skeleton</h3>
            <ChartSkeleton className="h-[400px]" />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500">AI Chat Skeleton</h3>
            <AIChatSkeleton />
          </div>
        </div>
      </section>

      {/* Empty States Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Empty States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <EmptyState
            title="No Documents Found"
            description="You haven't uploaded any documents yet. Start by uploading your first PDF."
            icon={<span className="material-symbols-outlined text-3xl text-slate-400">description</span>}
            action={
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">upload</span>
                Upload Document
              </button>
            }
          />
           <EmptyState
            title="No Team Members"
            description="Invite your colleagues to collaborate on this project."
            icon={<span className="material-symbols-outlined text-3xl text-slate-400">group_add</span>}
             action={
              <button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">mail</span>
                Send Invitation
              </button>
            }
          />
        </div>
      </section>
      
       {/* Sidebar Test Hint */}
      <section className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">info</span>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">Sidebar Verification</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              To verify the sidebar, please investigate the toggle button on the left edge of the screen using the actual sidebar component navigation. 
              The state should persist across page reloads (saved in localStorage).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
