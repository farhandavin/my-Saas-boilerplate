"use client";

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', score: 85 },
  { name: 'Tue', score: 88 },
  { name: 'Wed', score: 87 },
  { name: 'Thu', score: 92 },
  { name: 'Fri', score: 90 },
  { name: 'Sat', score: 94 },
  { name: 'Sun', score: 96 },
];

export const HealthScore = () => {
  const currentScore = data[data.length - 1].score;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Business Health Score</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{currentScore}</span>
            <span className="text-sm font-medium text-emerald-500">/ 100</span>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${currentScore >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700'}`}>
          EXCELLENT
        </div>
      </div>

      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-slate-400 mt-4 text-center">
        Calculated from Cash Flow, Team Velocity & Customer NPS
      </p>
    </div>
  );
};
