"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { BriefingSkeleton } from '@/components/ui/Skeleton';

interface MorningBriefingProps {
  userName: string;
  teamId?: string;
}

interface DigestData {
  narrative: string;
  date: string;
}

export const MorningBriefing = ({ userName, teamId }: MorningBriefingProps) => {
  const [loading, setLoading] = useState(true);
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDigest = async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      // const token = localStorage.getItem('token');
      const res = await fetch(`/api/ceo-digest?teamId=${teamId}`, {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDigest(data.data);
      }
    } catch (error) {
      console.error('Error fetching digest:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, [teamId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDigest();
  };

  if (loading) {
    return <BriefingSkeleton />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10 flex gap-6">
        <div className="hidden md:flex flex-col items-center pt-2">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-3">
            <Sun className="w-6 h-6" />
          </div>
          <div className="h-full w-0.5 bg-slate-100 dark:bg-slate-800"></div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                {getGreeting()}, {userName}.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                {digest?.narrative || (
                  <>
                    Yesterday's revenue was up <span className="text-emerald-500 font-bold">12%</span>. 
                    You have <span className="text-blue-500 font-bold">2 contracts</span> pending AI Pre-check. 
                    Focus on <span className="font-semibold text-slate-700 dark:text-slate-300">Project Phoenix</span> today to meet the Q4 deadline.
                  </>
                )}
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex gap-4 pt-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              View Revenue Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              Check Pending Contracts
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

