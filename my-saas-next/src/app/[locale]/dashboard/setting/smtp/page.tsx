'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SmtpSettings } from '@/components/settings/SmtpSettings';
import { toast } from 'sonner';

export default function SmtpPage() {
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/team', { 
                    headers: { 'Authorization': `Bearer ${token}` } 
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.teams && data.teams.length > 0) {
                        const teamId = data.teams[0].id; // Default to first
                        const detailRes = await fetch(`/api/team/${teamId}`, {
                             headers: { 'Authorization': `Bearer ${token}` } 
                        });
                        if (detailRes.ok) {
                            const detailData = await detailRes.json();
                            setTeam(detailData.team);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load team data');
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
    if (!team) return <div className="p-8 text-slate-500">No team found.</div>;
    
    // Check permissions if needed (Admin/Owner only etc)

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/dashboard/setting" className="text-sm text-slate-500 hover:text-indigo-600 mb-2 inline-block">
                    ← Back to Settings
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Configuration</h1>
            </div>

            <SmtpSettings teamId={team.id} initialData={team.smtpSettings} />
        </div>
    );
}
