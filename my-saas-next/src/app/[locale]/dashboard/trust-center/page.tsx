'use client';

import { useEffect, useState } from 'react';
import { TrustScoreCard } from '@/components/trust-center/TrustScoreCard';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TrustData {
  score: number;
  totalChecks: number;
  passedChecks: number;
  details: {
    category: string;
    name: string;
    passed: boolean;
    impact: 'high' | 'medium' | 'low';
    fixUrl?: string;
  }[];
}

export default function TrustCenterPage() {
  const [data, setData] = useState<TrustData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/trust-center');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
      setGenerating(true);
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Compliance Report (PDF) Generated! In a real app, this would download a file.");
      setGenerating(false);
  };

  if (loading) return <div className="p-8 text-center">Loading Trust Center...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Trust Center 🛡️</h1>
           <p className="text-slate-500 dark:text-[#92a4c9]">Monitor security compliance and generate audit reports.</p>
        </div>
        <button 
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
            {generating ? (
                <>
                    <span className="animate-spin text-lg">⏳</span> Generating...
                </>
            ) : (
                <>
                     <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Download Report
                </>
            )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Score */}
        <div className="lg:col-span-1">
            <TrustScoreCard 
                score={data.score} 
                totalChecks={data.totalChecks} 
                passedChecks={data.passedChecks} 
            />
             
             <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Why this matters?</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-400">
                    A high trust score increases customer confidence and accelerates enterprise sales cycles by proving your security posture.
                </p>
             </div>
        </div>

        {/* Right Column: Checklist */}
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Checklist</h3>
            
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {data.details.map((check, i) => (
                    <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 p-1 rounded-full ${check.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <span className="material-symbols-outlined text-lg">
                                    {check.passed ? 'check' : 'close'}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    {check.name}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                                        check.impact === 'high' ? 'bg-red-100 text-red-700' :
                                        check.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {check.impact} Impact
                                    </span>
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{check.category}</p>
                            </div>
                        </div>

                        {!check.passed && check.fixUrl && (
                            <Link 
                                href={check.fixUrl}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                Fix Issue <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
