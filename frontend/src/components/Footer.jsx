// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    // 1. UBAH BACKGROUND & BORDER FOOTER
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            {/* 2. UBAH WARNA JUDUL */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">SaaS<span className="text-blue-600">Boilerplate</span>.</h3>
            {/* 3. UBAH WARNA TEKS DESKRIPSI */}
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Build your next big idea with focus and clarity. The most efficient way to start your SaaS journey.
            </p>
            <div className="flex gap-4">
              {/* 4. UBAH WARNA ICON BUTTONS */}
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 cursor-pointer transition-colors"><Twitter size={18} /></div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 cursor-pointer transition-colors"><Github size={18} /></div>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 cursor-pointer transition-colors"><Linkedin size={18} /></div>
            </div>
          </div>

          {/* COLUMN 1 */}
          <div>
            {/* 5. UBAH HEADER KOLOM */}
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integration</Link></li>
            </ul>
          </div>

          {/* COLUMN 2 */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* COLUMN 3 */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} SaaS Boilerplate. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;