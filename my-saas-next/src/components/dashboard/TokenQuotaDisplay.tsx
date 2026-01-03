'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface TokenQuotaDisplayProps {
  teamId?: string;
  compact?: boolean;
}

interface QuotaData {
  used: number;
  limit: number;
  tier: string;
  resetDate: string;
}

export function TokenQuotaDisplay({ teamId, compact = false }: TokenQuotaDisplayProps) {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuota = async () => {
      if (!teamId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/ai/quota?teamId=${teamId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setQuota(data.data);
        }
      } catch (error) {
        console.error('Error fetching quota:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuota();
  }, [teamId]);

  if (loading) {
    return <Skeleton className="h-20 w-full rounded-xl" />;
  }

  if (!quota) {
    return null;
  }

  const usagePercent = Math.round((quota.used / quota.limit) * 100);
  const remaining = quota.limit - quota.used;
  const isWarning = usagePercent >= 80;
  const isCritical = usagePercent >= 90;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
        <Zap className={`w-4 h-4 ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-indigo-500'}`} />
        <div className="flex-1">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-slate-600 font-medium">{usagePercent}%</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isCritical ? 'bg-red-100' : isWarning ? 'bg-amber-100' : 'bg-indigo-100'
          }`}>
            <Zap className={`w-4 h-4 ${
              isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-indigo-600'
            }`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Token Usage</p>
            <p className="text-xs text-slate-500">{quota.tier} Plan</p>
          </div>
        </div>
        
        {isWarning && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            {isCritical ? 'Critical' : 'Warning'}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">
            {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} tokens
          </span>
          <span className={`font-semibold ${
            isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-700'
          }`}>
            {usagePercent}%
          </span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span>{remaining.toLocaleString()} tokens tersisa</span>
          <span>Reset: {new Date(quota.resetDate).toLocaleDateString()}</span>
        </div>
      </div>

      {isCritical && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
          <p className="text-sm text-red-700">
            <strong>Kuota hampir habis!</strong> Upgrade paket Anda untuk melanjutkan.
          </p>
          <a href="/billing" className="text-sm text-red-600 hover:text-red-700 font-medium underline">
            Upgrade sekarang →
          </a>
        </div>
      )}
    </div>
  );
}
