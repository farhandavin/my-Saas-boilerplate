'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface ComplianceStats {
  auditLogsCount: number;
  piiMaskingEnabled: boolean;
  dataRegion: string;
  ssoEnabled: boolean;
  teamMembersCount: number;
  documentsCount: number;
  lastAuditDate: string;
}

export default function ComplianceDashboard() {
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ComplianceStats>({
    auditLogsCount: 0,
    piiMaskingEnabled: false,
    dataRegion: 'id',
    ssoEnabled: false,
    teamMembersCount: 0,
    documentsCount: 0,
    lastAuditDate: ''
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch audit logs
      const auditRes = await fetch('/api/audit-logs?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setRecentLogs(auditData.logs || []);
        setStats(prev => ({
          ...prev,
          auditLogsCount: auditData.stats?.total || auditData.logs?.length || 0,
          lastAuditDate: auditData.logs?.[0]?.createdAt || new Date().toISOString()
        }));
      }

      // Fetch privacy/settings
      const privacyRes = await fetch('/api/privacy', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (privacyRes.ok) {
        const privacyData = await privacyRes.json();
        setStats(prev => ({
          ...prev,
          piiMaskingEnabled: (privacyData.globalEnabled && privacyData.stats?.activeRules > 0) || false
        }));
      }

      // Fetch general settings for region & SSO
      const settingsRes = await fetch('/api/settings/general', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setStats(prev => ({
          ...prev,
          dataRegion: settingsData.dataRegion || 'id',
          ssoEnabled: settingsData.ssoEnabled || false
        }));
      }

    } catch (error) {
      console.error('Failed to fetch compliance data', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegionName = (code: string) => {
    const regions: Record<string, string> = {
      'id': 'Indonesia (Jakarta)',
      'sg': 'Singapore',
      'eu': 'European Union',
      'us': 'United States'
    };
    return regions[code] || code;
  };

  const gdprScore = stats.piiMaskingEnabled ? 98 : 75;
  const isoControls = stats.auditLogsCount > 0 ? 112 : 80;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-4">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const handleExport = () => {
      alert("Downloading Compliance Report... (Mock PDF)");
  };

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-6 animate-fade-in pb-10 p-4 md:p-8">
      {/* Header Stats & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Overview</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Last audit: {new Date(stats.lastAuditDate).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#1e293b] px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button 
            onClick={fetchComplianceData}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#135bec] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b46b9] transition-colors shadow-[0_0_15px_rgba(19,91,236,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Privacy Status Card (was GDPR Mock) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111722] p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">policy</span>
              </div>
              <h3 className="font-medium text-slate-700 dark:text-slate-200">Privacy Status</h3>
            </div>
            <span className={`text-xs font-bold ${stats.piiMaskingEnabled ? 'text-emerald-500' : 'text-slate-500'}`}>
              {stats.piiMaskingEnabled ? 'Protected' : 'Standard'}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.piiMaskingEnabled ? 'PII Masking On' : 'PII Masking Off'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Data Protection</p>
            </div>
          </div>
        </div>

        {/* Security Audit Card (was ISO Mock) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111722] p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-purple-500/10 text-purple-500 dark:text-purple-400">
                <span className="material-symbols-outlined text-[20px]">security_update_good</span>
              </div>
              <h3 className="font-medium text-slate-700 dark:text-slate-200">Security Audit</h3>
            </div>
            <span className={`text-xs font-bold ${stats.auditLogsCount > 0 ? 'text-purple-500' : 'text-slate-500'}`}>
              {stats.auditLogsCount > 0 ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-end justify-between">
             <div>
               <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.auditLogsCount}</p>
               <p className="text-xs text-slate-500 mt-1">Total Controls Monitored</p>
             </div>
          </div>
        </div>

        {/* Audit Logs Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111722] p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                <span className="material-symbols-outlined text-[20px]">history</span>
              </div>
              <h3 className="font-medium text-slate-700 dark:text-slate-200">Total Events</h3>
            </div>
            <span className="text-emerald-500 text-xs font-bold">Logged</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.auditLogsCount}</p>
              <p className="text-xs text-slate-500 mt-1">System Activities</p>
            </div>
          </div>
        </div>

        {/* Data Residency Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111722] p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <h3 className="font-medium text-slate-700 dark:text-slate-200">Data Residency</h3>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{getRegionName(stats.dataRegion)}</p>
              <p className="text-xs text-slate-500 mt-1">Primary Region</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PII Masking Status */}
        <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Privacy Layer</h3>
          <div className="space-y-4">
            <Link href="/dashboard/privacy-layer" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${stats.piiMaskingEnabled ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {stats.piiMaskingEnabled ? 'check_circle' : 'cancel'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">PII Masking</span>
              </div>
              <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    stats.piiMaskingEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {stats.piiMaskingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-gray-600">chevron_right</span>
              </div>
            </Link>

            <Link href="/dashboard/setting" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${stats.ssoEnabled ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {stats.ssoEnabled ? 'check_circle' : 'cancel'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">SSO Authentication</span>
              </div>
              <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    stats.ssoEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {stats.ssoEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-gray-600">chevron_right</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              recentLogs.slice(0, 4).map((log, i) => (
                <div key={log.id || i} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-[16px]">
                      {log.action?.includes('login') ? 'login' : 
                       log.action?.includes('create') ? 'add' : 
                       log.action?.includes('delete') ? 'delete' : 'edit'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.entity}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
