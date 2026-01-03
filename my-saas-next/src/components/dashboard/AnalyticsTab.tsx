'use client';

import { useState, useEffect } from 'react';
import { TokenUsageChart } from '@/components/dashboard/TokenUsageChart';
import { CardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

interface Team {
  id: string;
  name: string;
  tier: string;
  aiUsageCount: number;
  aiTokenLimit: number;
  memberCount: number;
}

interface AnalyticsTabProps {
  team: Team | null;
}

export const AnalyticsTab = ({ team }: AnalyticsTabProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [team]);

  if (loading || !team) {
    return (
      <div>
        <div className="h-8 w-40 bg-slate-200 rounded mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const usagePercent = Math.round((team.aiUsageCount / team.aiTokenLimit) * 100);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics 📈</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">AI Usage Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tokens Used</span>
              <span className="text-xl font-bold text-indigo-600">{team.aiUsageCount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Token Limit</span>
              <span className="text-xl font-bold text-gray-900">{team.aiTokenLimit?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remaining</span>
              <span className="text-xl font-bold text-green-600">
                {(team.aiTokenLimit - team.aiUsageCount).toLocaleString()}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Usage</span>
                <span className={`font-medium ${usagePercent > 80 ? 'text-red-500' : 'text-gray-700'}`}>
                  {usagePercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    usagePercent > 90 ? 'bg-red-500' : 
                    usagePercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Members</span>
              <span className="text-xl font-bold text-indigo-600">{team.memberCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Tier</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                team.tier === 'ENTERPRISE' ? 'bg-amber-100 text-amber-700' :
                team.tier === 'PRO' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {team.tier}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Token/Member</span>
              <span className="text-xl font-bold text-gray-700">
                {team.memberCount > 0 ? Math.round(team.aiUsageCount / team.memberCount).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
         <h3 className="font-semibold text-gray-900 mb-6">Token Consumption Trend</h3>
         <TokenUsageChart />
      </div>
    </div>
  );
};

