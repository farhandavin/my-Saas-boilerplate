"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { subject: 'Legal', A: 80, fullMark: 100 },
  { subject: 'Finance', A: 98, fullMark: 100 },
  { subject: 'Ops', A: 86, fullMark: 100 },
  { subject: 'HR', A: 90, fullMark: 100 },
  { subject: 'Security', A: 65, fullMark: 100 },
  { subject: 'Market', A: 85, fullMark: 100 },
];

export const RiskRadar = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Risk Radar</h3>
          <p className="text-xs text-slate-400 mt-1">Real-time compliance monitoring</p>
        </div>
      </div>

      <div className="h-[180px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="A"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            <Tooltip 
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* Warning Badge overlay */}
        <div className="absolute top-0 right-0 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 dark:border-red-800">
          ! Security Risk
        </div>
      </div>
    </div>
  );
};
