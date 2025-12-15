// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, LogIn } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  return (
    // 1. UBAH DISINI: Tambahkan dark:bg-slate-950
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-300">
      
      <Navbar />

      {/* Abstract Background Element */}
      {/* 2. UBAH DISINI: Ubah warna elemen dekorasi agar tidak terlalu terang di dark mode */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50 dark:bg-blue-900/10 skew-x-12 transform origin-top translate-x-32 -z-10 transition-colors duration-300"></div>

      <main className="flex-1 flex flex-col items-start justify-center max-w-7xl mx-auto px-6 py-24 lg:py-32 pt-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 is now live
          </div>
          
          {/* 3. UBAH DISINI: Tambahkan dark:text-white pada Heading */}
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 tracking-tight transition-colors duration-300">
            Build faster with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Focus & Clarity.</span>
          </h1>
          
          {/* 4. UBAH DISINI: Tambahkan dark:text-slate-400 pada Paragraf */}
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg transition-colors duration-300">
            A clean, highly efficient SaaS boilerplate designed for readability and speed. Start your next big project without the clutter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth" className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
              <LogIn size={20} /> Join Now
            </Link>
            
            {/* 5. UBAH DISINI: Styling tombol dashboard untuk dark mode */}
            <Link to="/dashboard" className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-lg font-semibold rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2">
              <LayoutDashboard size={20} /> View Dashboard
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;