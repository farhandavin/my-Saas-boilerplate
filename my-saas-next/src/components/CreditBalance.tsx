// frontend/src/components/CreditBalance.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const CreditBalance = () => {
  const { team } = useAuth();

  if (!team) return null;

  // Hitung persentase pemakaian
  const usage = team.aiUsageCount || 0;
  const limit = team.aiTokenLimit || 1000;
  const percentage = Math.min((usage / limit) * 100, 100);
  
  // Tentukan warna progress bar (Hijau -> Kuning -> Merah)
  let colorClass = "bg-green-500";
  if (percentage > 75) colorClass = "bg-yellow-500";
  if (percentage > 90) colorClass = "bg-red-500";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
          AI Token Balance
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          team.tier === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {team.tier} PLAN
        </span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold text-gray-800">{usage.toLocaleString()} Used</span>
          <span className="text-gray-500">of {limit.toLocaleString()}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full ${colorClass} transition-all duration-500`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Reset otomatis pada tanggal 1 bulan depan. 
          <a href="/pricing" className="text-indigo-600 hover:underline ml-1">Upgrade Quota &rarr;</a>
        </p>
      </div>
    </div>
  );
};

export default CreditBalance;