'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * OAuth Callback Handler
 * Syncs HttpOnly cookie token to localStorage for client-side API calls.
 * Mimics the same storage pattern as manual email/password login.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Syncing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncToken = async () => {
      try {
        setStatus('Fetching session data...');
        
        const res = await fetch('/api/auth/token', {
          credentials: 'include',
        });
        
        console.log('[Auth Callback] Token fetch response:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('[Auth Callback] Data received:', data.success ? 'Yes' : 'No');
          
          if (data.success && data.token) {
            // Store token - same as manual login
            localStorage.setItem('token', data.token);
            
            // Store team ID - same as manual login
            if (data.team?.id) {
              localStorage.setItem('currentTeamId', data.team.id);
            }
            
            setStatus('Session synced! Redirecting to dashboard...');
            console.log('[Auth Callback] Token and teamId stored in localStorage');
            
            setTimeout(() => {
              router.replace('/dashboard');
            }, 100);
            return;
          } else {
            setError('Invalid session data');
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(`Server error: ${res.status} - ${errData.error || 'Unknown'}`);
        }
        
        setTimeout(() => {
          router.replace('/auth?error=token_sync_failed');
        }, 2000);
        
      } catch (err: any) {
        console.error('[Auth Callback] Error:', err);
        setError(err.message || 'Unknown error');
        setTimeout(() => {
          router.replace('/auth?error=token_sync_failed');
        }, 2000);
      }
    };

    syncToken();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg mb-2">{status}</p>
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">Error: {error}</p>
            <p className="text-slate-400 text-xs mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
