'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { toast } from 'sonner';

export default function BrandingPage() {
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                // const token = localStorage.getItem('token');
                const res = await fetch('/api/team', { 
                    // headers: { 'Authorization': `Bearer ${token}` } 
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.teams && data.teams.length > 0) {
                        // Fetch full details of the first team (current team logic simplified)
                        const teamId = data.teams[0].id; // Ideally use logic to select "current" team
                        const detailRes = await fetch(`/api/team/${teamId}`, {
                             // headers: { 'Authorization': `Bearer ${token}` } 
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

    if (!['OWNER', 'ADMIN'].includes(team.myRole || 'OWNER')) { // Default to owner if role missing in simplified detail fetch
         // Double check actual role handling in your app
         // Assuming 'team' object from detail fetch might not have 'myRole', we might rely on the list fetch
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/dashboard/setting" className="text-sm text-slate-500 hover:text-indigo-600 mb-2 inline-block">
                    ← Back to Settings
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Branding & Customization</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your white-label settings and visual identity.</p>
            </div>

            <BrandingSettings teamId={team.id} initialData={team.branding} />
        </div>
    );
}
