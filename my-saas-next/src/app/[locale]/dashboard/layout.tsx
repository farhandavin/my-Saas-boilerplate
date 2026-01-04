'use client';

import { useEffect, useState } from 'react';
import { ChatWidget } from "@/components/ai/ChatWidget";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { TeamProvider } from "@/context/TeamContext";
import { DynamicThemeProvider } from "@/components/providers/DynamicThemeProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
     // Quick fetch for sidebar user profile
     const fetchUser = async () => {
           try {
             const res = await fetch('/api/auth/me');
             if(res.ok) {
                const data = await res.json();
                setUser(data.user);
             }
           } catch(e) {}
     };
     fetchUser();
  }, []);

  return (
    <TeamProvider>
        <DynamicThemeProvider>
            <div className="flex min-h-screen bg-[#f6f7f8] dark:bg-[#101922]">
            <Sidebar user={user} />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative bg-[#f6f7f8] dark:bg-[#101922]">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12">
                {children}
                </main>
                <ChatWidget />
                <CommandPalette />
            </div>
            </div>
        </DynamicThemeProvider>
    </TeamProvider>
  );
}
