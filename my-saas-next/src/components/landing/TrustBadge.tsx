import { motion } from 'framer-motion';
import { Database, Lock, Server, Globe } from 'lucide-react';

export const TrustBadge = () => {
  return (
    <section className="py-20 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-12 flex items-center justify-center gap-2">
          <Lock className="w-6 h-6 text-emerald-500" />
          Bank-Grade Security Architecture
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Shared */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative group"
          >
            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Tenant Shared</h3>
            <p className="text-slate-400 text-sm">Efficient resource usage with logical isolation via tenant_id.</p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </motion.div>

          {/* Card 2: Schema */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative group"
          >
            <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Schema Isolated</h3>
            <p className="text-slate-400 text-sm">Enhanced security with separate PostgreSQL schemas per client.</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-4 h-4 border border-purple-500 rounded-full"></div>
              <div className="w-4 h-4 border border-purple-500 rounded-full"></div>
            </div>
          </motion.div>

          {/* Card 3: Dedicated */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30 relative group shadow-lg shadow-emerald-900/10"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
              Enterprise
            </div>
            <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
              <Server className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Physically Isolated</h3>
            <p className="text-slate-400 text-sm">Ultimate security. Your own database instance on dedicated hardware.</p>
            <div className="mt-4 mx-auto w-8 h-8 border-2 border-emerald-500 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
