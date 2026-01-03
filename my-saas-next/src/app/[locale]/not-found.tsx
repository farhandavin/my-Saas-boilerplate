'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#f6f6f8] dark:bg-[#101622] text-slate-900 dark:text-white font-sans antialiased selection:bg-[#135bec]/30">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-solid border-slate-200 dark:border-[#232f48] px-6 py-4 lg:px-10 sticky top-0 z-50 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-md">
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="size-8 text-[#135bec]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
              <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Enterprise OS</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">System Status</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Operational
            </span>
          </div>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-slate-200 dark:ring-[#232f48]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD23vXzIM3BravJRzlzCZclNWIoyBVIJugcpFmqlicpnL-XUy6xx6EkQDTrFZXuJ1NtfMXUjtQBi6IRFLa7D9xEHrAqfYxEtwTTLte2HXs0RywjkBYD6G3GCbek-cARMSU5gVLAe9WddKQ2rZzQRMVGg1nzShaozQgmBtEPzWwPA1HNhYDBmbVoYqeIyPP3MlNlPtebGuuLOg7CkLRduvqDTj3kj8XcZXGSKuJEmiN1EMCAhbQrAQarFVy0zXTB9nKrQ9LdCt-p3BI")'}}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#135bec]/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <div className="layout-content-container flex flex-col items-center max-w-[800px] w-full z-10 relative">
          {/* Hero Image / Graphic */}
          <div className="mb-2 relative group perspective-1000">
            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-[#135bec]/20 ring-1 ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#135bec]/80 to-purple-600/80 mix-blend-overlay z-10"></div>
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt="Abstract dark 3D geometric shapes representing data infrastructure" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuATydkT95eOQqsQ9HxRScw0s-QwjQtUEvtoLfFAMTilqNeYsVwODux8qd8g7xlNGZucrkq_dts82fqDjVtgDGNf2LZk0J2HQ2TKhWlIKPZpeJ3XzFLZWtz8iHFT5To4HZqCTh3Rc6GEWez7aoeIjKjRmxJP5XPEvb16hkjvONunTe4b5d7DhHCZgKDMkMDXcbpGL7SNAg8XjTsOlj_HdIVf0_5YtwYP71a_h96EngbAnPk_NunDPsjIJE0DbXbltoX4rdTGj87MgDI"
              />
            </div>
            {/* Floating 404 Badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#1a2332] border border-[#232f48] px-6 py-2 rounded-full shadow-lg">
              <span className="text-[#135bec] font-bold tracking-widest text-lg">404 ERROR</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center mt-12 space-y-4 px-4">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              System Path Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              The requested resource is unavailable. It may have been moved, deleted, or you might not have the required permissions to access this segment of the OS.
            </p>
          </div>

          {/* AI Search Bar */}
          <div className="w-full max-w-md mt-10 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#135bec] to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-white dark:bg-[#1a2332] rounded-lg p-1.5 shadow-xl border border-slate-200 dark:border-[#232f48]">
              <div className="p-2 text-[#135bec]">
                <span className="material-symbols-outlined text-[24px]">colors_spark</span>
              </div>
              <input 
                className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 text-sm md:text-base py-2" 
                placeholder="Ask the OS to find what you need..." 
                type="text"
              />
              <button aria-label="Search" className="bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-md transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold">AI Powered Navigation</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#135bec] hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-[#135bec]/25 hover:shadow-[#135bec]/40 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:ring-offset-2 dark:focus:ring-offset-[#101622]"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Return to Dashboard
            </Link>
            <Link 
              href="/support"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-transparent border border-slate-200 dark:border-[#232f48] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white px-8 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <span className="material-symbols-outlined text-[20px]">contact_support</span>
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-[#232f48] bg-[#f6f6f8] dark:bg-[#101622] text-center z-10">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 px-6">
          <Link className="text-sm text-slate-500 hover:text-[#135bec] dark:text-slate-400 dark:hover:text-white transition-colors" href="#">Documentation</Link>
          <Link className="text-sm text-slate-500 hover:text-[#135bec] dark:text-slate-400 dark:hover:text-white transition-colors" href="#">Help Center</Link>
          <Link className="text-sm text-slate-500 hover:text-[#135bec] dark:text-slate-400 dark:hover:text-white transition-colors" href="#">System Status</Link>
          <div className="hidden md:block w-px h-4 bg-slate-300 dark:bg-[#232f48]"></div>
          <p className="text-xs text-slate-400 dark:text-slate-600">© 2024 Enterprise OS Inc.</p>
        </div>
      </footer>
    </div>
  );
}
