'use client';

import { CeoDigestWidget } from '@/components/dashboard/CeoDigestWidget';
import { RevenueTrendCard } from '@/components/dashboard/RevenueTrendCard';
import { RecentActivityCard, SystemHealthCard } from '@/components/dashboard/MetricCard';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{t('overview')}</h1>
        <p className="text-slate-500 dark:text-[#92a4c9] text-base font-normal">Welcome back, Executive. Here's what's happening today.</p>
      </div>

      {/* CEO Digest Widget (The Main Focus) */}
      <CeoDigestWidget />

      {/* Performance Strip */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">monitoring</span>
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RevenueTrendCard />
          <RecentActivityCard />
          <SystemHealthCard />
        </div>
      </div>
      
      <div className="h-20"></div> {/* Spacer for scrolling */}
    </div>
  );
}
