'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatsRow } from '@/components/privacy/StatsRow';
import { GlobalSwitch } from '@/components/privacy/GlobalSwitch';
import { RulesList } from '@/components/privacy/RulesList';

interface MaskingResult {
  masked: string;
  entitiesFound: { entityType: string; masked: string }[];
  processingTimeMs: number;
  summary: string;
}

export default function PrivacyLayerPage() {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [inputText, setInputText] = useState(
    "Customer John Doe (john.doe@email.com) requested a refund for order #9921 using card 4532-1234-5678-9010. His national ID is 3175002910900001."
  );
  const [maskedOutput, setMaskedOutput] = useState<MaskingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ activeRules: 0, totalRules: 0 });

  const fetchPrivacyRules = useCallback(async () => {
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch('/api/privacy', {
        // headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setGlobalEnabled(data.globalEnabled);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch privacy rules:', error);
    }
  }, []);

  useEffect(() => {
    fetchPrivacyRules();
  }, [fetchPrivacyRules]);

  const handleTestMasking = async () => {
    setIsProcessing(true);
    try {
      // const token = localStorage.getItem('token');
      const response = await fetch('/api/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      if (data.success) {
        setMaskedOutput({
          masked: data.masked,
          entitiesFound: data.entitiesFound,
          processingTimeMs: data.processingTimeMs,
          summary: data.summary,
        });
      }
    } catch (error) {
      console.error('Masking test failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // const token = localStorage.getItem('token');
      await fetch('/api/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ globalEnabled }),
      });
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#111722]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 -mx-6 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Privacy Layer Configuration</h2>
          <p className="text-slate-500 dark:text-[#92a4c9] text-sm">Manage PII masking rules and data sanitation for Gemini API integration.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-600 dark:text-emerald-500 text-xs font-bold uppercase tracking-wide">System Operational</span>
          </span>
          <button 
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-[#135bec] hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Changes
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#111722] p-5 border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/40 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 material-symbols-outlined text-[20px]">rule</span>
              <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">Active Rules</p>
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{stats.activeRules} / {stats.totalRules}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#111722] p-5 border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/40 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 material-symbols-outlined text-[20px]">visibility_off</span>
              <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">Last Test</p>
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
            {maskedOutput ? `${maskedOutput.entitiesFound.length} entities` : 'Not tested'}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#111722] p-5 border border-slate-200 dark:border-slate-800 hover:border-[#135bec]/40 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-orange-500/10 text-orange-500 material-symbols-outlined text-[20px]">verified_user</span>
              <p className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium">Processing Time</p>
            </div>
          </div>
          <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
            {maskedOutput ? `${maskedOutput.processingTimeMs}ms` : '—'}
          </p>
        </div>
      </div>

      {/* Global Switch */}
      <GlobalSwitch />

      {/* Main Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-[500px]">

        {/* Left: Rules Configuration */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <RulesList onRulesChange={fetchPrivacyRules} />
        </div>
        
        {/* Right: Simulation & Preview */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-4 h-full">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#135bec]">science</span>
              Live Redaction Simulation
            </h3>
            <div className="flex-1 bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-lg">
              <div className="flex flex-col gap-2">
                <label className="text-slate-500 dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">Raw Input (Unstructured Text)</label>
                <textarea 
                  className="w-full h-32 bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-lg p-3 text-sm text-slate-700 dark:text-gray-300 focus:ring-[#135bec] focus:border-[#135bec] font-mono resize-none" 
                  placeholder="Paste text here to test rules..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              
              <button 
                onClick={handleTestMasking}
                disabled={isProcessing}
                className="w-full py-2 bg-[#135bec] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    Test Masking
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 rotate-90">arrow_forward</span>
              </div>
              
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-500 dark:text-[#92a4c9] text-xs font-semibold uppercase tracking-wider">Processed Output (To Gemini API)</label>
                  {maskedOutput && (
                    <span className="text-[10px] text-emerald-500 font-mono">Latency: {maskedOutput.processingTimeMs}ms</span>
                  )}
                </div>
                <div className="w-full h-full min-h-[140px] bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] border-l-4 border-l-[#135bec] rounded-r-lg p-4 text-sm font-mono leading-relaxed text-slate-700 dark:text-gray-400">
                  {maskedOutput ? maskedOutput.masked : (
                    <span className="text-slate-400 italic">Click "Test Masking" to see the processed output</span>
                  )}
                </div>
              </div>
              
              {maskedOutput && maskedOutput.entitiesFound.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-[#30363d] flex flex-col gap-2">
                  <p className="text-xs text-slate-500 dark:text-[#92a4c9] font-semibold">Entities Detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {maskedOutput.entitiesFound.map((entity, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                        {entity.entityType}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t border-slate-200 dark:border-[#30363d] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                <p className="text-xs text-slate-500 dark:text-[#92a4c9]">AI Models will receive the processed output only. Original PII is never logged.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
