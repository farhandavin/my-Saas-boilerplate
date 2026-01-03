'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dirty, setDirty] = useState(false);
  const { showSuccess, showError } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    workspaceId: '',
    supportEmail: '',
    industry: 'Fintech & Banking',
    dataRegion: 'id', // 'id' | 'global'
    currency: 'IDR',
    timezone: 'asia_jakarta',
    language: 'en'
  });
  
  // Initial state for discard
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/settings/general');
      const data = await res.json();
      if (res.ok) {
        setFormData(data);
        setInitialData(data);
      } else {
        showError(data.error || 'Failed to load settings');
      }
    } catch (error) {
      showError('Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  // Handle changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showSuccess('Settings saved successfully');
        setInitialData(formData);
        setDirty(false);
      } else {
        showError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      showError('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Discard unsaved changes?')) {
        if (initialData) {
            setFormData(initialData);
        }
        setDirty(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-[960px] mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8 md:px-10 pb-32 animate-fade-in">
      {/* Page Heading */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-[-0.02em]">General Settings</h1>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base mt-2">Manage workspace identity, data residency, and global preferences.</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-700 dark:text-white rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-white/10">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Audit Log
          </button>
        </div>
      </div>

      {/* Section: Workspace Identity */}
      <section className="mb-10 border-b border-gray-200 dark:border-[#232f48] pb-10">
        <h2 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight mb-6">Workspace Identity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logo Upload */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-3">Workspace Logo</label>
            <div className="flex flex-col gap-4">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl w-32 h-32 border-2 border-dashed border-gray-300 dark:border-[#232f48] relative group overflow-hidden bg-gray-50 dark:bg-transparent" 
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAA8SgMSM4dR36vagBJqthjGUxfafpMt00CXH8NrvSI-yKu7sA58zCEMrzDbBtmU8pUhSrisrbea1TxTEgZYRA2SB90IPFCfb2Q9PHOYYCkp0zFmqsqJJhAm2q-5HXdGXKEOzTn4-0zjkve-lTx38mWg5WEjc4qNlSTR3q_sXzWSwxJZl4yKu0iqBTGn-Ibwl5l-ECZ1Foj2q8qKJMZE7ozkwLzNQFTWfRp5pUQ-x753w8FoGCO7YBrRLSIVxXKeqxX8a_IttyzrqI")' }}
              >
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-white">edit</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#232f48] hover:bg-gray-200 dark:hover:bg-[#2d3b55] text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors w-32">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload
                </button>
                <p className="text-gray-500 dark:text-[#92a4c9] text-xs">Recommended: 512x512px (PNG, JPG)</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="col-span-1 lg:col-span-2 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-2">Company Name</label>
              <input 
                className="w-full bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#232f48] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#135bec] focus:border-[#135bec] block p-2.5 placeholder-gray-500" 
                placeholder="e.g. Acme Inc." 
                type="text" 
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-2">Workspace ID</label>
                <div className="relative">
                  <input 
                    className="w-full bg-gray-50 dark:bg-[#151b26] border border-gray-200 dark:border-[#232f48] text-gray-500 dark:text-gray-400 text-sm rounded-lg block p-2.5 cursor-not-allowed select-all font-mono" 
                    readOnly 
                    type="text" 
                    value={formData.workspaceId}
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(formData.workspaceId)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-2">Support Email</label>
                <input 
                  className="w-full bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#232f48] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#135bec] focus:border-[#135bec] block p-2.5" 
                  placeholder="support@company.com" 
                  type="email" 
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-2">Industry</label>
              <select 
                className="w-full bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#232f48] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#135bec] focus:border-[#135bec] block p-2.5"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
              >
                <option value="Fintech & Banking">Fintech & Banking</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Logistics">Logistics</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Technology">Technology</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Data Residency Router */}
      <section className="mb-10 border-b border-gray-200 dark:border-[#232f48] pb-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">Data Residency Router</h2>
              <span className="bg-[#135bec]/20 text-[#135bec] text-xs font-bold px-2 py-0.5 rounded border border-[#135bec]/20">BETA</span>
            </div>
            <p className="text-gray-500 dark:text-[#92a4c9] text-sm mt-1">Configure where your data is physically stored and processed to meet local compliance regulations.</p>
          </div>
          <button className="text-[#135bec] text-sm font-medium hover:underline flex items-center gap-1">
            Learn about compliance
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Indonesia (Active) */}
          <label className="relative cursor-pointer group">
            <input 
                type="radio" 
                name="dataRegion" 
                value="id"
                checked={formData.dataRegion === 'id'}
                onChange={(e) => handleChange('dataRegion', e.target.value)}
                className="peer sr-only" 
            />
            <div className="h-full p-5 rounded-xl border-2 peer-checked:border-[#135bec] border-gray-200 dark:border-gray-700 bg-white dark:bg-[#135bec]/5 transition-all peer-checked:bg-[#135bec]/5 relative overflow-hidden">
              <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 transition-opacity">
                <div className="size-5 rounded-full bg-[#135bec] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-lg bg-gray-100 dark:bg-[#232f48] flex items-center justify-center text-2xl shadow-inner border border-gray-200 dark:border-white/5">
                  🇮🇩
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">Indonesia (Jakarta)</h3>
                  <p className="text-gray-500 dark:text-[#92a4c9] text-sm mt-1 mb-3">Data remains within Indonesian borders. Compliant with <span className="text-gray-900 dark:text-white font-medium">PSE Kominfo</span> regulations.</p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium border border-green-500/20">
                      <span className="size-1.5 rounded-full bg-green-500 dark:bg-green-400"></span>
                      Operational
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-[#232f48] text-gray-500 dark:text-[#92a4c9] text-xs font-medium border border-gray-200 dark:border-white/5">
                      Latency: 12ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </label>

          {/* Option 2: Global */}
          <label className="relative cursor-pointer group">
            <input 
                type="radio" 
                name="dataRegion" 
                value="global"
                checked={formData.dataRegion === 'global'}
                onChange={(e) => handleChange('dataRegion', e.target.value)}
                className="peer sr-only" 
            />
            <div className="h-full p-5 rounded-xl border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#1a2332] transition-all hover:border-gray-300 dark:hover:border-[#92a4c9]/40 peer-checked:border-[#135bec] peer-checked:bg-[#135bec]/10">
              <div className="absolute top-3 right-3 opacity-0 peer-checked:opacity-100 transition-opacity">
                <div className="size-5 rounded-full bg-[#135bec] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-lg bg-gray-100 dark:bg-[#232f48] flex items-center justify-center text-[#135bec] shadow-inner border border-gray-200 dark:border-white/5">
                  <span className="material-symbols-outlined text-[28px]">public</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg">Global (Multi-Region)</h3>
                  <p className="text-gray-500 dark:text-[#92a4c9] text-sm mt-1 mb-3">Distributed storage across US, EU, and Asia Pacific for maximum redundancy and global speed.</p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-[#232f48] text-gray-500 dark:text-[#92a4c9] text-xs font-medium border border-gray-200 dark:border-white/5">
                      Standard Tier
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-[#232f48] text-gray-500 dark:text-[#92a4c9] text-xs font-medium border border-gray-200 dark:border-white/5">
                      Latency: Variable
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </section>

      {/* Section: Regional Settings */}
      <section className="mb-10 border-b border-gray-200 dark:border-[#232f48] pb-10">
        <h2 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight mb-6">Regional Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-2">Default Currency</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">payments</span>
              <select 
                className="w-full bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#232f48] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#135bec] focus:border-[#135bec] block pl-10 p-2.5 appearance-none"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                <option value="IDR">IDR - Indonesian Rupiah</option>
                <option value="USD">USD - US Dollar</option>
                <option value="SGD">SGD - Singapore Dollar</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-[#92a4c9] mt-2">Used for dashboard reporting.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-2">Timezone</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">schedule</span>
              <select 
                className="w-full bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#232f48] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#135bec] focus:border-[#135bec] block pl-10 p-2.5 appearance-none"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                <option value="asia_jakarta">(GMT+07:00) Jakarta</option>
                <option value="asia_singapore">(GMT+08:00) Singapore</option>
                <option value="utc">UTC</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-[#92a4c9] mb-2">Language</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">translate</span>
              <select 
                className="w-full bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#232f48] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#135bec] focus:border-[#135bec] block pl-10 p-2.5 appearance-none"
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="en">English (US)</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Danger Zone */}
      <section>
        <div className="border border-red-500/30 dark:border-red-900/50 rounded-xl overflow-hidden bg-red-50 dark:bg-red-900/5">
          <div className="p-6">
            <h3 className="text-red-700 dark:text-white text-lg font-bold mb-1">Danger Zone</h3>
            <p className="text-red-600 dark:text-[#92a4c9] text-sm mb-6">Irreversible actions that affect your entire workspace.</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-t border-red-200 dark:border-red-900/30">
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-semibold">Delete this workspace</p>
                <p className="text-gray-500 dark:text-[#92a4c9] text-xs mt-1">Once you delete a workspace, there is no going back. Please be certain.</p>
              </div>
              <button className="whitespace-nowrap px-4 py-2 border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-colors">
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Bar */}
      {dirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[960px] md:w-[calc(100%-18rem)] md:translate-x-32 z-30">
          <div className="bg-[#232f48]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 px-6 animate-fade-in-up">
            <p className="text-white text-sm hidden sm:block">You have unsaved changes</p>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                onClick={handleDiscard}
                className="px-4 py-2 text-[#92a4c9] hover:text-white text-sm font-bold transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-[#135bec] hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-[#135bec]/20 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
