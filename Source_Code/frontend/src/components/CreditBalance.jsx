// frontend/src/components/CreditBalance.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Pastikan api.js punya method get (axios)
import { Zap } from 'lucide-react';

const CreditBalance = ({ teamId }) => {
  const [quota, setQuota] = useState(null);

  const fetchQuota = async () => {
    try {
      const res = await api.get(`/ai/quota?teamId=${teamId}`); // Sesuaikan path API client Anda
      setQuota(res.data);
    } catch (error) {
      console.error("Failed to fetch quota", error);
    }
  };

  useEffect(() => {
    if (teamId) fetchQuota();
  }, [teamId]);

  if (!quota) return <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>;

  // Warna bar progress
  let progressColor = "bg-green-500";
  if (quota.percentage > 70) progressColor = "bg-yellow-500";
  if (quota.percentage > 90) progressColor = "bg-red-500";

  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
          <Zap size={12} /> AI Credits
        </span>
        <span className="text-xs font-bold text-gray-700">
          {quota.tier === 'ENTERPRISE' ? '∞' : `${quota.used} / ${quota.limit}`}
        </span>
      </div>
      
      {quota.tier !== 'ENTERPRISE' && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div 
            className={`${progressColor} h-1.5 rounded-full transition-all duration-500`} 
            style={{ width: `${quota.percentage}%` }}
          ></div>
        </div>
      )}

      {quota.remaining < 5 && quota.tier !== 'ENTERPRISE' && (
        <p className="text-[10px] text-red-500 mt-1 font-medium">
          Kuota hampir habis!
        </p>
      )}
    </div>
  );
};

export default CreditBalance;