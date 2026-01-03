'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark';
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Inline SVG icons
  const SunIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const MoonIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const MenuIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  const XIcon = () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-blue-700 transition-colors">
              B
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              Business<span className="text-blue-600">OS</span>.
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'About'].map((item) => (
              <Link 
                key={item} 
                href={item === 'Pricing' ? '/pricing' : '/'} 
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <Link href="/auth" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Log In
            </Link>
            <Link href="/auth" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
              Get Started →
            </Link>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 hover:text-blue-600">
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 absolute w-full px-6 py-4 flex flex-col gap-4 shadow-xl transition-colors duration-300">
          <Link href="/" className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600">Features</Link>
          <Link href="/pricing" className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600">Pricing</Link>
          <Link href="/auth" className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600">Log In</Link>
          <Link href="/auth" className="w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;