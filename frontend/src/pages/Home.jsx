// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, LogIn, CheckCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50 skew-x-12 transform origin-top translate-x-32 -z-10"></div>

      {/* Navbar Minimalis */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">SaaS<span className="text-blue-600">Boilerplate</span>.</h1>
        <div className="space-x-4">
          <Link to="/auth" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Log In</Link>
          <Link to="/auth" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-500/20">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-start justify-center max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 is now live
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
            Build faster with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Focus & Clarity.</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
            A clean, highly efficient SaaS boilerplate designed for readability and speed. Start your next big project without the clutter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth" className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
              <LogIn size={20} /> Join Now
            </Link>
            <Link to="/dashboard" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 text-lg font-semibold rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              <LayoutDashboard size={20} /> View Dashboard
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer Minimal */}
      <footer className="w-full border-t border-slate-100 py-6 text-center text-slate-400 text-sm bg-white">
        © 2025 SaaS Boilerplate. Crafted for efficiency.
      </footer>
    </div>
  );
};

export default Home;