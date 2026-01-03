'use client';

import { useEffect, useState } from 'react';

// Replaces "RecentApprovalsCard"
import { toast } from 'sonner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

export function RecentActivityCard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchData() {
    setLoading(true);
    setError(false);
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard/stats', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      
      const json = await res.json();
      setActivities(json.recentActivity || []);
    } catch (e) {
      console.error("Failed to fetch activity", e);
      setError(true);
      toast.error("Failed to load recent activity");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <h3 className="text-foreground dark:text-white font-bold text-lg">Recent Activity</h3>
        <button className="text-sm text-primary font-medium hover:underline">See all</button>
      </div>
      <div className="flex flex-col gap-3 flex-1 min-h-[200px]">
        {loading ? (
           [1,2,3].map(i => (
             <div key={i} className="flex items-center gap-3 p-3">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="space-y-2 flex-1">
                   <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                   <div className="h-2 w-1/4 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded" />
                </div>
             </div>
           ))
        ) : error ? (
           <ErrorDisplay 
             message="Could not load activity log." 
             onRetry={fetchData} 
             compact 
             className="flex-1"
           />
        ) : activities.length === 0 ? (
           <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
             <div className="size-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                 <span className="material-symbols-outlined text-slate-400">history</span>
             </div>
             <p className="text-sm font-medium text-text-sub">No recent activity</p>
             <p className="text-xs text-slate-400 max-w-[180px]">Your team's actions will appear here once they start working.</p>
           </div>
        ) : (
          activities.map((log: any) => (
             <ActivityItem 
               key={log.id}
               title={log.action}
               user={log.user?.name || log.entity} 
               date={new Date(log.createdAt).toLocaleDateString()}
               icon={mapActionToIcon(log.action)}
               color={mapActionToColor(log.action)}
             />
          ))
        )}
      </div>
    </div>
  );
}

function mapActionToIcon(action: string) {
  if (action?.includes('LOGIN')) return 'login';
  if (action?.includes('CREATE')) return 'add_circle';
  if (action?.includes('UPDATE')) return 'edit_document';
  if (action?.includes('DELETE')) return 'delete';
  return 'history';
}

function mapActionToColor(action: string) {
  if (action?.includes('LOGIN')) return 'blue';
  if (action?.includes('CREATE')) return 'emerald';
  if (action?.includes('DELETE')) return 'rose';
  return 'slate';
}

function ActivityItem({ title, user, icon, color, date }: any) {
  const colorMap: any = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`size-8 rounded-full ${colorMap[color] || colorMap.slate} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{title}</p>
          <p className="text-xs text-slate-500">{user}</p>
        </div>
      </div>
      <span className="text-xs text-slate-400">{date}</span>
    </div>
  );
}

import { SensitiveData } from '@/components/ui/SensitiveData';

export function SystemHealthCard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    setError(false);
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard/stats', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setMetrics(json.metrics);
    } catch (e) { 
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 h-full flex flex-col justify-center">
         <ErrorDisplay 
           message="Failed to load system metrics" 
           onRetry={fetchData}
           compact 
         />
      </div>
    )
  }

  return (
    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-foreground dark:text-white font-bold text-lg">AI Resource Usage</h3>
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          <span className="material-symbols-outlined text-[16px]">smart_toy</span>
          Active
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 mt-2">
        <div className="bg-slate-50 dark:bg-[#111722] p-4 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-sub mb-1">AI Calculation Cost</p>
            <p className="text-xl font-bold text-foreground dark:text-white">
              <SensitiveData>
                ${(metrics?.aiTokenCost || 0).toFixed(2)}
              </SensitiveData>
            </p>
          </div>
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">currency_exchange</span>
          </div>
        </div>
      </div>
    </div>
  );
}
