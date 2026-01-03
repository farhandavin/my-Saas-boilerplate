'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { showSuccess, showError } = useToast();

  const [config, setConfig] = useState({
    ssoEnabled: false,
    ssoProvider: 'Okta',
    passwordRotationDays: 90,
    sessionTimeoutMinutes: 30
  });

  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/settings/security');
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
        setRoles(data.roles);
      } else {
        showError(data.error || 'Failed to load security settings');
      }
    } catch (error) {
      showError('Failed to load security settings');
    } finally {
      setFetching(false);
    }
  };

  const updateConfig = async (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig); // Optimistic update
    
    try {
      const res = await fetch('/api/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      
      if (res.ok) {
        showSuccess('Settings updated');
      } else {
        showError('Failed to save settings');
        // Revert on failure would go here
      }
    } catch (error) {
       showError('Failed to save settings');
    }
  };

  if (fetching) {
     return (
       <div className="max-w-[1000px] mx-auto p-4 md:p-10 min-h-[400px] flex items-center justify-center">
         <div className="text-gray-500">Loading security configuration...</div>
       </div>
     );
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-10 pb-32 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security & Access</h1>
        <p className="text-gray-500 dark:text-[#92a4c9] mt-2">Manage roles, authentication methods, and security policies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Roles & Permissions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Roles Card */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-200 dark:border-[#232f48] flex justify-between items-center">
                <div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Roles & Permissions</h3>
                   <p className="text-sm text-gray-500 dark:text-[#92a4c9]">Control access levels for your team members.</p>
                </div>
                <button className="px-4 py-2 bg-[#135bec] hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                   + Create Role
                </button>
             </div>
             
             <div className="divide-y divide-gray-100 dark:divide-[#232f48]">
                {roles.map((role: any) => (
                    <div key={role.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#232f48]/50 transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                              ${role.name === 'Administrator' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20' : 
                                role.name === 'Member' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-800'
                              }
                          `}>
                             {role.name[0]}
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {role.name}
                                {role.isSystem && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">SYSTEM</span>}
                             </h4>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{role.usersCount || 0} users assigned</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                             {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#1a2332]"></div>
                             ))}
                          </div>
                          <button className="text-gray-400 hover:text-[#135bec] opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="material-symbols-outlined">edit</span>
                          </button>
                       </div>
                    </div>
                ))}
             </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] shadow-sm p-6">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
             <div className="space-y-4">
                 {/* Current Session */}
                 <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white dark:bg-[#1a2332] rounded shadow-sm text-green-600">
                          <span className="material-symbols-outlined">desktop_windows</span>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                             Windows 11 · Chrome
                             <span className="text-[10px] font-extrabold bg-green-200 text-green-800 px-1.5 py-0.5 rounded">THIS DEVICE</span>
                          </p>
                          <p className="text-xs text-gray-500">Jakarta, ID · 103.20.x.x</p>
                       </div>
                    </div>
                    <span className="text-xs text-green-600 font-bold">Active Now</span>
                 </div>
                 
                 {/* Other Session */}
                 <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#232f48]/50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-gray-100 dark:bg-[#232f48] rounded text-gray-500">
                          <span className="material-symbols-outlined">smartphone</span>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">iPhone 14 · Safari</p>
                          <p className="text-xs text-gray-500">Singapore, SG · 10 days ago</p>
                       </div>
                    </div>
                    <button className="text-xs text-red-600 hover:underline font-medium">Revoke</button>
                 </div>
             </div>
          </div>
        </div>

        {/* Right Column: Policies & Auth */}
        <div className="space-y-6">
           
           {/* Authentication Policies */}
           <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] p-6 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Authentication Policies</h3>
               
               <div className="space-y-6">
                  {/* SSO */}
                  <div className="flex items-start justify-between">
                     <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Single Sign-On (SSO)</p>
                        <p className="text-xs text-gray-500 dark:text-[#92a4c9]">Enforce login via Identity Provider.</p>
                     </div>
                     <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={config.ssoEnabled}
                            onChange={(e) => updateConfig('ssoEnabled', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#135bec]"></div>
                     </div>
                  </div>

                  {/* Password Rotation */}
                  <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Rotation</label>
                        <span className="text-xs font-bold text-[#135bec]">{config.passwordRotationDays} days</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="365" 
                        step="30"
                        value={config.passwordRotationDays}
                        onChange={(e) => updateConfig('passwordRotationDays', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#135bec]" 
                      />
                      <p className="text-xs text-gray-500 mt-2">Force users to reset password periodically.</p>
                  </div>

                  {/* Session Timeout */}
                  <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Idle Session Timeout</label>
                        <span className="text-xs font-bold text-[#135bec]">{config.sessionTimeoutMinutes} mins</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="240" 
                        step="15"
                        value={config.sessionTimeoutMinutes}
                        onChange={(e) => updateConfig('sessionTimeoutMinutes', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#135bec]" 
                      />
                  </div>
               </div>
           </div>

           {/* Audit Log Preview */}
           <div className="rounded-2xl bg-gradient-to-br from-[#1c2333] to-[#2a1c20] p-6 text-white overflow-hidden relative group cursor-pointer hover:shadow-xl transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-50">
                  <span className="material-symbols-outlined text-4xl">history_edu</span>
               </div>
               <h3 className="text-lg font-bold mb-1">Audit Logs</h3>
               <p className="text-sm text-gray-300 mb-4 z-10 relative">Monitor all workspace activities for security.</p>
               <button className="text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded transition-colors backdrop-blur-sm">
                  View Full Logs
               </button>
           </div>
        </div>
      </div>
    </div>
  );
}
