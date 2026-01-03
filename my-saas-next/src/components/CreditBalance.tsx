'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from './ui/Skeleton';

interface TeamData {
  aiUsageCount: number;
  aiTokenLimit: number;
  tier: string;
}

const CreditBalance = () => {
  const [team, setTeam] = useState<TeamData | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // const token = localStorage.getItem('token');
        // if (!token) return;
        
        const res = await fetch('/api/billing/usage', {
          // headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success && json.data) {
          setTeam({
            aiUsageCount: json.data.currentUsage || 0,
            aiTokenLimit: json.data.limit || 1000,
            tier: json.data.tier || 'FREE'
          });
        }
      } catch (error) {
        console.error('Failed to fetch team data', error);
      }
    };

    fetchTeam();
  }, []);

  if (!team) {
    return (
      <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    );
  }

  // Hitung persentase pemakaian
  const usage = team.aiUsageCount || 0;
  const limit = team.aiTokenLimit || 1000;
  const percentage = Math.min((usage / limit) * 100, 100);
  
  // Tentukan warna progress bar (Hijau -> Kuning -> Merah)
  let colorClass = "bg-green-500";
  if (percentage > 75) colorClass = "bg-yellow-500";
  if (percentage > 90) colorClass = "bg-red-500";

  return (
    <div className="bg-white dark:bg-[#1a2632] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">
          AI Token Balance
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          team.tier === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' : 
          team.tier === 'PRO' ? 'bg-indigo-100 text-indigo-700' : 
          'bg-gray-100 text-gray-600'
        }`}>
          {team.tier} PLAN
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold text-gray-800 dark:text-white">{usage.toLocaleString()} Used</span>
          <span className="text-gray-500 dark:text-gray-400">of {limit.toLocaleString()}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full ${colorClass} transition-all duration-500`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Reset otomatis pada tanggal 1 bulan depan. 
          <Link href="/pricing" className="text-indigo-600 hover:underline ml-1">Upgrade Quota →</Link>
        </p>
      </div>
    </div>
  );
};

export default CreditBalance;