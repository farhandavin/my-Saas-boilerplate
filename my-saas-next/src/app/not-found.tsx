"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Visual Icon */}
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white dark:bg-[#1e293b] rounded-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-6xl filter grayscale opacity-80">🔭</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Page Not Found
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                The page you are looking for does not exist or has been moved.
              </p>
            </div>

            {/* Action */}
            <div>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/25"
              >
                Return Home
              </Link>
            </div>
            
            <p className="text-xs text-slate-400 mt-8">
              Error Code: 404 • Global Fallback
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
