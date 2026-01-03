import { motion } from 'framer-motion';
import { ArrowRight, Database, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-20 pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v2.0 Now Available with RAG
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Transform Raw Data into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Business Gold</span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              The only 3-Pillar Business Operating System (BOS) that combines AI Intelligence, Robust Infrastructure, and Automated Monetization in one suite.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/auth/register?role=ADMIN" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
                Start Building Contract
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#pricing" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition-all border border-slate-700">
                Calculate Pricing
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/50">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Uptime</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">50k+</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">AI Queries</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">&lt;50ms</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Latency</div>
              </div>
            </div>
          </motion.div>
          
          {/* 3D Visualization Animation */}
          <div className="relative h-[500px] w-full flex items-center justify-center">
            {/* Central Core */}
            <motion.div 
              animate={{ 
                rotate: 360,
                boxShadow: ["0 0 20px rgba(59, 130, 246, 0.3)", "0 0 50px rgba(59, 130, 246, 0.6)", "0 0 20px rgba(59, 130, 246, 0.3)"]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-40 h-40 bg-slate-900 border border-blue-500/30 rounded-full flex items-center justify-center z-10 backdrop-blur-xl"
            >
              <Zap className="w-16 h-16 text-blue-400" />
            </motion.div>
            
            {/* Orbiting Elements - Ingest */}
            <motion.div 
              className="absolute w-[280px] h-[280px] border border-dashed border-slate-700 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-2 rounded-lg border border-slate-700 text-xs text-slate-300">
                Raw Data
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-slate-800 p-2 rounded-lg border border-slate-700 text-xs text-slate-300">
                Documents
              </div>
            </motion.div>
            
            {/* Orbiting Elements - Output */}
            <motion.div 
              className="absolute w-[400px] h-[400px] border border-slate-800 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-1/4 right-0 bg-emerald-900/40 p-3 rounded-lg border border-emerald-500/30 text-emerald-400 font-bold shadow-lg shadow-emerald-900/20 backdrop-blur-md">
                $$ Profit
              </div>
              <div className="absolute bottom-1/4 left-0 bg-blue-900/40 p-3 rounded-lg border border-blue-500/30 text-blue-400 font-bold shadow-lg shadow-blue-900/20 backdrop-blur-md">
                Intelligence
              </div>
            </motion.div>
            
            {/* Connecting Lines */}
            <svg className="absolute w-full h-full pointer-events-none opacity-30">
              <line x1="10%" y1="10%" x2="50%" y2="50%" stroke="url(#line-gradient)" strokeWidth="2" />
              <line x1="90%" y1="90%" x2="50%" y2="50%" stroke="url(#line-gradient)" strokeWidth="2" />
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
