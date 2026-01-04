'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    fromEmail: string;
    fromName: string;
}

interface SmtpSettingsProps {
    teamId: string;
    initialData?: SmtpConfig;
}

export function SmtpSettings({ teamId, initialData }: SmtpSettingsProps) {
    const [config, setConfig] = useState<SmtpConfig>({
        host: '',
        port: 587,
        user: '',
        pass: '',
        fromEmail: '',
        fromName: '',
        ...initialData
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (key: keyof SmtpConfig, value: string | number) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/team/${teamId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ smtpSettings: config })
            });

            if (!res.ok) throw new Error('Failed to update SMTP settings');
            
            toast.success('SMTP settings saved successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save SMTP settings');
        } finally {
            setLoading(false);
        }
    };

    return (
     <div className="bg-white dark:bg-[#111722] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">SMTP Configuration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure your own email server for sending notifications.</p>
        </div>
        
        <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Host</label>
                    <input 
                        type="text" 
                        value={config.host}
                        onChange={(e) => handleChange('host', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="smtp.example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Port</label>
                    <input 
                        type="number" 
                        value={config.port}
                        onChange={(e) => handleChange('port', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="587"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <input 
                        type="text" 
                        value={config.user}
                        onChange={(e) => handleChange('user', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="user@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input 
                        type="password" 
                        value={config.pass}
                        onChange={(e) => handleChange('pass', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From Name</label>
                    <input 
                        type="text" 
                        value={config.fromName}
                        onChange={(e) => handleChange('fromName', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="My SaaS Support"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From Email</label>
                    <input 
                        type="email" 
                        value={config.fromEmail}
                        onChange={(e) => handleChange('fromEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="support@example.com"
                    />
                </div>
            </div>

             <div className="pt-4 flex gap-4">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
             </div>
        </div>
     </div>
    );
}
