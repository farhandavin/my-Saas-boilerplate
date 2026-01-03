"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, Zap, Users } from 'lucide-react';

export const PricingCalculator = () => {
  const [users, setUsers] = useState(5);
  const [tier, setTier] = useState<'SHARED' | 'ISOLATED'>('SHARED');
  
  // Pricing Constants
  const BASE_PRICE = tier === 'SHARED' ? 299000 : 999000;
  const USER_PRICE = tier === 'SHARED' ? 25000 : 50000;
  
  const totalPrice = BASE_PRICE + (Math.max(0, users - (tier === 'SHARED' ? 2 : 10)) * USER_PRICE);
  
  return (
    <section id="pricing" className="py-24 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Transparent Pricing Simulator</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Choose the perfect infrastructure for your business. Upgrade anytime as you grow.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Controls */}
            <div className="p-8 space-y-8">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-4 block">Database Architecture</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-lg">
                  <button 
                    onClick={() => setTier('SHARED')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${tier === 'SHARED' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Users className="w-4 h-4" />
                    Shared
                  </button>
                  <button 
                    onClick={() => setTier('ISOLATED')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${tier === 'ISOLATED' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Database className="w-4 h-4" />
                    Isolated
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {tier === 'SHARED' ? 'Cost-effective for startups. Shared resources.' : 'Maximum security & performance. Dedicated resources.'}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-slate-300">Team Size</label>
                  <span className="text-white font-bold bg-slate-700 px-3 py-1 rounded-md">{users} Users</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={users} 
                  onChange={(e) => setUsers(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>1 User</span>
                  <span>50 Users</span>
                  <span>100+ Users</span>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <h4 className="text-sm font-semibold text-white mb-2">Included Features:</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    {tier === 'SHARED' ? '500 AI Tokens/mo' : '50,000 AI Tokens/mo'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    {tier === 'SHARED' ? 'Standard Support' : 'Priority 24/7 Support'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    {tier === 'SHARED' ? 'Daily Backups' : 'Real-time Backups'}
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Price Display */}
            <div className="bg-slate-900 p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 text-center">
                <p className="text-slate-400 mb-2">Estimated Monthly Cost</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg text-slate-400">Rp</span>
                  <motion.span 
                    key={totalPrice}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-bold text-white tracking-tight"
                  >
                    {(totalPrice / 1000).toLocaleString('id-ID')}k
                  </motion.span>
                </div>
                <p className="text-slate-500 text-sm mt-4">/ month (billed annually)</p>
                
                <button className="w-full mt-8 bg-white text-slate-900 font-bold py-4 rounded-lg hover:bg-slate-100 transition-colors">
                  Choose {tier === 'SHARED' ? 'Pro' : 'Enterprise'} Plan
                </button>
                <p className="text-xs text-slate-600 mt-4">No credit card required for 14-day trial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
