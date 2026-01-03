'use client';

import { useEffect, useState } from 'react';

function RevenueTrendCard() {
  const [data, setData] = useState<{ month: string, revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.revenueTrend || []);
        }
      } catch (e) {
        console.error("Failed to revenue stats", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const currentRevenue = data.length > 0 ? data[data.length - 1].revenue : 0;
  const maxRevenue = Math.max(...data.map(d => d.revenue), 100); // Scale factor, min 100 for non-zero chart

  return (
    <div className="bg-white dark:bg-[#151c2b] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">Revenue Trend</h3>
          <p className="text-sm text-slate-500">Last 6 Months</p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Chart Visualization */}
      <div className="flex items-end gap-2 h-32 mt-auto">
        {loading ? (
           // Skeleton
           Array(6).fill(0).map((_, i) => (
             <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t animate-pulse h-full"></div>
           ))
        ) : data.length === 0 ? (
          <div className="w-full flex items-center justify-center text-slate-400 text-sm h-full">No revenue data</div>
        ) : (
          data.map((item, index) => {
             const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 10); // Min height 10%
             const isLast = index === data.length - 1;
             return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div 
                  className={`w-full rounded-t transition-all duration-500 ${isLast ? 'bg-[#135bec] shadow-lg shadow-[#135bec]/25' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-[#135bec]/50'}`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    ${item.revenue.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{item.month}</span>
              </div>
             );
          })
        )}
      </div>
    </div>
  );
}

export { RevenueTrendCard };
