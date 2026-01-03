'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TableSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

interface PrivacyRule {
  entityType: string;
  sensitivity: 'critical' | 'high' | 'medium' | 'low';
  maskingMethod: string;
  enabled: boolean;
  pattern?: string;
}


export function RulesList({ onRulesChange }: { onRulesChange?: () => void }) {
  const [rules, setRules] = useState<PrivacyRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/privacy', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleUpdate = async (ruleName: string, updates: Partial<PrivacyRule>) => {
    // Optimistic UI update
    setRules(prev => prev.map(r => r.entityType === ruleName ? { ...r, ...updates } : r));

    try {
      // const token = localStorage.getItem('token');
      await fetch('/api/privacy', {
        method: 'PUT',
        headers: { 
           'Content-Type': 'application/json',
           // 'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ruleName, ...updates })
      });
      // Notify parent to refresh stats
      if (onRulesChange) onRulesChange();
    } catch (e) {
      console.error("Failed to update rule", e);
      fetchRules(); // Revert on failure
    }
  };

  if (loading) return <TableSkeleton rows={4} />;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-[#135bec]">list_alt</span>
        Data Entity Rules
      </h3>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2333] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#92a4c9]">
          <div className="col-span-4">Entity Type</div>
          <div className="col-span-2 text-center">Sensitivity</div>
          <div className="col-span-4">Masking Method</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        
        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {rules.map((rule, idx) => (
             <RuleRow key={idx} rule={rule} onUpdate={handleUpdate} />
          ))}
          {rules.length === 0 && (
            <div className="p-8">
             <EmptyState
                title="No Rules Configured"
                description="Create your first privacy rule to automatically mask sensitive PII data in your AI interactions."
                icon={<span className="material-symbols-outlined text-3xl text-slate-300">security</span>}
             />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RuleRow({ rule, onUpdate }: { rule: PrivacyRule, onUpdate: (name: string, updates: any) => void }) {
  const meta: any = {
    credit_card: { icon: 'credit_card', color: 'blue', label: 'Credit Card', sub: 'PCI-DSS', sensitivity: 'critical' },
    national_id: { icon: 'id_card', color: 'purple', label: 'National ID', sub: 'GDPR / PDP', sensitivity: 'critical' },
    email: { icon: 'mail', color: 'green', label: 'Email Address', sub: 'PII Identifier', sensitivity: 'high' },
    phone: { icon: 'phone', color: 'yellow', label: 'Phone Number', sub: 'Contact Info', sensitivity: 'high' },
    ip_address: { icon: 'dns', color: 'slate', label: 'IP Address', sub: 'Device Info', sensitivity: 'medium' },
    person_name: { icon: 'person', color: 'orange', label: 'Person Name', sub: 'NER Detection', sensitivity: 'high' },
  };

  const info = meta[rule.entityType] || { icon: 'rule', color: 'slate', label: rule.entityType, sub: 'Custom Rule', sensitivity: rule.sensitivity || 'low' };

  const colorMap: any = {
      blue: 'text-blue-500 bg-blue-500/10',
      purple: 'text-purple-500 bg-purple-500/10',
      green: 'text-green-500 bg-green-500/10',
      yellow: 'text-yellow-500 bg-yellow-500/10',
      slate: 'text-slate-500 bg-slate-500/10',
      orange: 'text-orange-500 bg-orange-500/10',
  };

  const sensitivityColor: any = {
      critical: 'text-red-600 bg-red-400/10 ring-red-400/20',
      high: 'text-orange-600 bg-orange-400/10 ring-orange-400/20',
      medium: 'text-green-600 bg-green-400/10 ring-green-400/20',
      low: 'text-slate-600 bg-slate-400/10 ring-slate-400/20',
  };

  return (
    <div className="grid grid-cols-12 gap-4 items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#1a2333]/50 transition-colors group">
      <div className="col-span-4 flex items-center gap-3">
        <div className={`h-8 w-8 rounded flex items-center justify-center ${colorMap[info.color]}`}>
          <span className="material-symbols-outlined text-[18px]">{info.icon}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-900 dark:text-white text-sm font-medium">{info.label}</span>
          <span className="text-slate-500 dark:text-[#92a4c9] text-xs">{info.sub}</span>
        </div>
      </div>
      <div className="col-span-2 text-center">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset uppercase ${sensitivityColor[info.sensitivity]}`}>
            {info.sensitivity}
        </span>
      </div>
      <div className="col-span-4">
        <select 
            value={rule.maskingMethod} 
            onChange={(e) => onUpdate(rule.entityType, { maskingMethod: e.target.value })}
            className="w-full bg-slate-50 dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-[#135bec] focus:border-[#135bec] block p-2"
        >
          <option value="redact">Redact (Full)</option>
          <option value="showLast4">Show Last 4</option>
          <option value="hash">Hash (SHA-256)</option>
          <option value="substitution">Substitution</option>
          <option value="characterReplace">Character Replace (*)</option>
        </select>
      </div>
      <div className="col-span-2 flex justify-end">
        <label className="relative inline-flex cursor-pointer items-center">
          <input 
            type="checkbox" 
            checked={rule.enabled} 
            onChange={(e) => onUpdate(rule.entityType, { enabled: e.target.checked })}
            className="sr-only peer" 
          />
          <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#135bec] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
        </label>
      </div>
    </div>
  );
}
