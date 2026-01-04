'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface Branding {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
}

interface Team {
    id: string;
    name: string;
    slug: string;
    myRole: string;
    branding?: Branding;
}

interface TeamContextType {
    currentTeam: Team | null;
    isLoading: boolean;
    refreshTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTeam = async () => {
        try {
            // 1. Get List of Teams
            const res = await fetch('/api/team', { credentials: 'include' });
            
            if (res.ok) {
                const data = await res.json();
                if (data.teams && data.teams.length > 0) {
                    // 2. Determine which team to load
                    // Using localStorage preference or default to first
                    let teamIdToLoad = localStorage.getItem('currentTeamId') || data.teams[0].id;
                    
                    // Verify the locally stored ID is actually in the list (permission check)
                    if (!data.teams.find((t: { id: string }) => t.id === teamIdToLoad)) {
                        teamIdToLoad = data.teams[0].id;
                    }
                    
                    localStorage.setItem('currentTeamId', teamIdToLoad);

                    // 3. Fetch Full Team Details (including Branding)
                    const detailRes = await fetch(`/api/team/${teamIdToLoad}`, { credentials: 'include' });
                    
                    if (detailRes.ok) {
                        const detailData = await detailRes.json();
                        setCurrentTeam(detailData.team);
                    }
                }
            }
        } catch (error) {
            console.error("Team Provider Error:", error);
            // Don't toast here to avoid spamming on every nav if API is down
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    return (
        <TeamContext.Provider value={{ currentTeam, isLoading, refreshTeam: fetchTeam }}>
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
}
