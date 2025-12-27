'use client';
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

const AiUsageChart = ({ teamId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/ai/usage-history?teamId=${teamId}`);
        // SOLUSI: Pastikan data yang masuk adalah Array agar Recharts tidak crash
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          console.error("Format data API tidak valid (Bukan Array):", res.data);
          setData([]); 
        }
      } catch (error) {
        console.error("Gagal load chart data", error);
        setData([]); // Set kosong jika error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
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