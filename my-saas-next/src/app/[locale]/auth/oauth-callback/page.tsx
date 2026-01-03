'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = () => {
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const teamStr = searchParams.get('team');
        const isNewUser = searchParams.get('isNewUser') === 'true';

        if (!token || !userStr || !teamStr) {
          throw new Error('Missing authentication data');
        }

        // Parse data
        const user = JSON.parse(userStr);
        const team = JSON.parse(teamStr);

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', userStr);
        localStorage.setItem('team', teamStr);
        localStorage.setItem('role', team.role);

        setStatus('success');
        setMessage(isNewUser 
          ? 'Account created successfully! Redirecting...' 
          : 'Logged in successfully! Redirecting...'
        );

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);

      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        // Redirect back to auth page after delay
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101922] flex items-center justify-center">
      <div className="bg-white dark:bg-[#1a2632] rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 text-center max-w-md w-full mx-4">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Authenticating
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
              Success!
            </h2>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Authentication Failed
            </h2>
          </>
        )}

        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#101922] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
