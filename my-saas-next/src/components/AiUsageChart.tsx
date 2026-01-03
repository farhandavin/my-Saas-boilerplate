'use client';
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageData {
  date: string;
  usage: number;
}

interface AiUsageChartProps {
  teamId: string;
}

const AiUsageChart = ({ teamId }: AiUsageChartProps) => {
  const [data, setData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/billing/usage`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        // Use usage history from response or generate mock data
        if (json.data?.usageHistory && Array.isArray(json.data.usageHistory)) {
          setData(json.data.usageHistory);
        } else {
          // Generate sample data if no history
          setData([]);
        }
      } catch (error) {
        console.error("Gagal load chart data", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // SOLUSI: Validasi tambahan untuk mencegah error .slice() di internal Recharts
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-center p-4">
        <p className="font-medium text-sm">Belum ada aktivitas AI bulan ini.</p>
        <p className="text-xs mt-1 italic">Tingkatkan produktivitas dengan fitur AI kami!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">AI Usage Trends</h3>
        <p className="text-sm text-gray-500">Penggunaan kredit token dalam 30 hari terakhir.</p>
      </div>

      {/* SOLUSI: Menggunakan min-h untuk mencegah warning width(-1) height(-1) */}
      <div className="h-64 w-full min-h-[256px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#9ca3af' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#9ca3af' }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="usage" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorUsage)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AiUsageChart;