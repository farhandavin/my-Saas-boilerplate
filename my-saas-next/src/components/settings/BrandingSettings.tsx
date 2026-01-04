'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTeam } from '@/context/TeamContext'; // Assuming context or we pass props

interface BrandingConfig {
    primaryColor: string;
    accentColor: string;
    logoUrl: string;
    faviconUrl: string;
    companyName: string;
    customDomain: string;
}

interface BrandingSettingsProps {
    teamId: string;
    initialData?: BrandingConfig;
}

export function BrandingSettings({ teamId, initialData }: BrandingSettingsProps) {
    const [branding, setBranding] = useState<BrandingConfig>({
        primaryColor: '#135bec',
        accentColor: '#6366f1',
        logoUrl: '',
        faviconUrl: '',
        companyName: '',
        customDomain: '',
        ...initialData
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (key: keyof BrandingConfig, value: string) => {
        setBranding(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // const token = localStorage.getItem('token');
            const res = await fetch(`/api/team/${teamId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ branding })
            });

            if (!res.ok) throw new Error('Failed to update branding');
            
            toast.success('Branding update successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save branding');
        } finally {
            setLoading(false);
        }
    };

    return (
     <div className="bg-white dark:bg-[#111722] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Branding & White-Labeling</h2>
        
        <div className="space-y-6 max-w-2xl">
            {/* Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                    <input 
                        type="text" 
                        value={branding.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="My SaaS Corp"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Domain</label>
                    <input 
                        type="text" 
                        value={branding.customDomain}
                        onChange={(e) => handleChange('customDomain', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="app.example.com"
                    />
                    <p className="text-xs text-slate-500 mt-1">CNAME configuration required.</p>
                </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Color</label>
                     <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={branding.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            className="h-10 w-12 p-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input 
                            type="text"
                            value={branding.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none" 
                        />
                     </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Accent Color</label>
                     <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={branding.accentColor}
                            onChange={(e) => handleChange('accentColor', e.target.value)}
                            className="h-10 w-12 p-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input 
                            type="text"
                            value={branding.accentColor}
                            onChange={(e) => handleChange('accentColor', e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white outline-none" 
                        />
                     </div>
                </div>
            </div>

            {/* Logos */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={branding.logoUrl}
                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="https://example.com/logo.png"
                    />
                    {branding.logoUrl && (
                        <div className="w-12 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                            <img 
                                src={branding.logoUrl} 
                                alt="Preview" 
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('bg-red-50', 'dark:bg-red-900/20');
                                }} 
                            />
                            {/* Fallback for error state handled by onError hiding the img */}
                        </div>
                    )}
                </div>
            </div>

             <div className="pt-4">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving Changes...' : 'Save Branding Settings'}
                </button>
             </div>
        </div>
     </div>
    );
}
