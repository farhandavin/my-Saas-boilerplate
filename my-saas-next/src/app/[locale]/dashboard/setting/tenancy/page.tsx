'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function TenancySettingsPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [tenancyInfo, setTenancyInfo] = useState<{
    tier: string;
    tenancyMode: string;
    hasDedicatedDb: boolean;
    databaseUrlPreview: string | null;
    isEnterprise: boolean;
  } | null>(null);

  const [databaseUrl, setDatabaseUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    fetchTenancyInfo();
  }, []);

  const fetchTenancyInfo = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/tenancy', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setTenancyInfo(data);
      }
    } catch (error) {
      showError('Failed to fetch tenancy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = async () => {
    if (!databaseUrl) {
      showError('Please enter a database URL');
      return;
    }

    try {
      setSaving(true);
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/tenancy', {
        method: 'POST',
        headers: { 
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ databaseUrl })
      });

      const data = await res.json();

      if (res.ok) {
        showSuccess('Dedicated database configured!');
        setDatabaseUrl('');
        setShowUrlInput(false);
        fetchTenancyInfo();
      } else {
        showError(data.error || 'Configuration failed');
      }
    } catch (error) {
      showError('Failed to configure database');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async () => {
    if (!confirm('Are you sure you want to revert to shared database?')) return;

    try {
      setSaving(true);
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/tenancy', {
        method: 'POST',
        headers: { 
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'revert' })
      });

      if (res.ok) {
        showSuccess('Reverted to shared database');
        fetchTenancyInfo();
      }
    } catch (error) {
      showError('Failed to revert');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Isolation</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Configure hybrid multi-tenancy for your workspace.
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              tenancyInfo?.tenancyMode === 'dedicated' 
                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' 
                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {tenancyInfo?.tenancyMode === 'dedicated' ? 'database' : 'cloud'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {tenancyInfo?.tenancyMode === 'dedicated' ? 'Dedicated Database' : 'Shared Database'}
              </h3>
              <p className="text-sm text-gray-500">
                Tier: <span className="font-bold">{tenancyInfo?.tier}</span>
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            tenancyInfo?.tenancyMode === 'dedicated' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {tenancyInfo?.tenancyMode}
          </span>
        </div>

        {tenancyInfo?.hasDedicatedDb && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500 mb-1">Connected Database:</p>
            <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {tenancyInfo.databaseUrlPreview}
            </code>
          </div>
        )}

        {/* Enterprise Features */}
        {tenancyInfo?.isEnterprise ? (
          <div className="space-y-4">
            {tenancyInfo.tenancyMode === 'shared' && !showUrlInput && (
              <button
                onClick={() => setShowUrlInput(true)}
                className="w-full py-3 px-4 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Configure Dedicated Database
              </button>
            )}

            {showUrlInput && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    PostgreSQL Connection URL
                  </label>
                  <input
                    type="password"
                    value={databaseUrl}
                    onChange={(e) => setDatabaseUrl(e.target.value)}
                    placeholder="postgres://user:password@host:5432/database"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Supports: Neon, Supabase, AWS RDS, Railway, or any PostgreSQL database.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUrlInput(false)}
                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfigure}
                    disabled={saving}
                    className="flex-1 py-3 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Connecting...' : 'Connect & Migrate'}
                  </button>
                </div>
              </div>
            )}

            {tenancyInfo.tenancyMode === 'dedicated' && (
              <button
                onClick={handleRevert}
                disabled={saving}
                className="w-full py-3 px-4 border border-red-200 dark:border-red-800 text-red-600 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Revert to Shared Database
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-purple-500 mb-2">workspace_premium</span>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Enterprise Feature</h4>
            <p className="text-sm text-gray-500 mb-4">
              Dedicated database isolation is available on the Enterprise plan.
            </p>
            <a 
              href="/pricing" 
              className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
            >
              Upgrade to Enterprise
            </a>
          </div>
        )}
      </div>

      {/* Tenancy Modes Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-blue-500">cloud</span>
            <h4 className="font-bold text-gray-900 dark:text-white">Shared Database</h4>
          </div>
          <p className="text-sm text-gray-500">
            Data isolated by team_id on our managed infrastructure. Best for FREE and PRO tiers.
          </p>
        </div>
        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-emerald-500">database</span>
            <h4 className="font-bold text-gray-900 dark:text-white">Dedicated Database</h4>
          </div>
          <p className="text-sm text-gray-500">
            Your own PostgreSQL instance. Full data sovereignty and compliance requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
