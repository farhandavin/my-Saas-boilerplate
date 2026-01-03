'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  useEffect(() => {
    // Log error to console (in production, send to Sentry/logging service)
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30">
            <span className="text-5xl">⚠️</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          {t('title')}
        </h1>
        
        {/* Description */}
        <p className="text-slate-400 mb-6 leading-relaxed">
          {t('description')}
        </p>

        {/* Reference ID */}
        {error.digest && (
          <div className="mb-8 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">{t('referenceId')}</p>
            <code className="text-sm text-slate-300 font-mono">{error.digest}</code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            🔄 {t('retry')}
          </button>
          
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
          >
            🏠 {t('backToDashboard')}
          </Link>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-slate-500">
          {t('needHelp')}{' '}
          <a href="mailto:support@businessos.com" className="text-indigo-400 hover:text-indigo-300">
            {t('contactSupport')}
          </a>
        </p>
      </div>
    </div>
  );
}
