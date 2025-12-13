import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn, Sun, Moon } from 'lucide-react';
import useTheme from '../hooks/useTheme'; // Pastikan path import ini benar

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Panggil Hook

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:bg-blue-700 transition-colors">
              S
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              SaaS<span className="text-blue-600">Boilerplate</span>.
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'About'].map((item) => (
              <Link 
                key={item} 
                to="/" 
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* ACTION BUTTONS & TOGGLE */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Tombol Dark Mode Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to="/auth" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Log In
            </Link>
            <Link to="/auth" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
              Get Started <LogIn size={18} />
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Toggle di Mobile */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 hover:text-blue-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 absolute w-full px-6 py-4 flex flex-col gap-4 shadow-xl transition-colors duration-300">
          <Link to="/" className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600">Features</Link>
          <Link to="/" className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600">Pricing</Link>
          <Link to="/auth" className="text-slate-600 dark:text-slate-300 py-2 hover:text-blue-600">Log In</Link>
          <Link to="/auth" className="w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;