import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, Globe, Lock, ArrowRight, CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

export const SecurityConsole = () => {
  const [activeTab, setActiveTab] = useState<'isolation' | 'migration' | 'webhooks'>('isolation');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Security & Integration Console
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium border border-indigo-200">
              ADMIN
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage data isolation, migrations, and system integrations.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <TabButton id="isolation" label="Data Isolation" icon={<Shield size={16} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="migration" label="Migration Wizard" icon={<RefreshCw size={16} />} active={activeTab} onClick={setActiveTab} />
        <TabButton id="webhooks" label="Webhooks" icon={<Zap size={16} />} active={activeTab} onClick={setActiveTab} />
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'isolation' && <DataIsolationView />}
        {activeTab === 'migration' && <MigrationWizard />}
        {activeTab === 'webhooks' && <WebhookDashboard />}
      </div>
    </div>
  );
};

const TabButton = ({ id, label, icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
      active === id
        ? 'border-indigo-600 text-indigo-600'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

const DataIsolationView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <CheckCircle size={12} />
            RLS Active
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-6">Data Architecture Visualization</h3>
        
        {/* Visualization of Multi-Tenancy */}
        <div className="relative h-64 flex items-center justify-center">
          {/* Shared Database Core */}
          <div className="absolute z-10 w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
            <Database className="text-indigo-600" size={48} />
          </div>
          
          {/* Orbiting Tenants */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center"
              animate={{
                rotate: 360,
                x: [100 * Math.cos(i * 72 * Math.PI / 180), 100 * Math.cos((i * 72 + 360) * Math.PI / 180)],
                y: [100 * Math.sin(i * 72 * Math.PI / 180), 100 * Math.sin((i * 72 + 360) * Math.PI / 180)],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
                delay: -i * 2
              }}
            >
              <Lock size={20} className="text-slate-400" />
            </motion.div>
          ))}

          {/* Connection Lines (Static for visual simplicty, conceptually dynamic) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <div className="w-64 h-64 rounded-full border border-dashed border-indigo-400"></div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl">
             <div className="font-bold text-2xl text-slate-800">99.9%</div>
             <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Uptime</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
             <div className="font-bold text-2xl text-slate-800">5ms</div>
             <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Latency</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
             <div className="font-bold text-2xl text-slate-800">AES-256</div>
             <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Encryption</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
           <h3 className="font-bold mb-2 flex items-center gap-2">
             <Shield size={20} />
             Security Score
           </h3>
           <div className="text-4xl font-bold mb-2">92/100</div>
           <p className="text-indigo-100 text-sm">Your organization meets most compliance standards. Enable 2FA for 100%.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-4">Isolation Mode</h3>
           <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
               <div className="w-4 h-4 rounded-full border-4 border-indigo-600 bg-white"></div>
               <div>
                 <p className="text-sm font-bold text-indigo-900">Logical Isolation (RLS)</p>
                 <p className="text-xs text-indigo-700">Current • Cost Efficient</p>
               </div>
             </div>
             <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg opacity-60">
               <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
               <div>
                 <p className="text-sm font-bold text-slate-700">Schema Isolation</p>
                 <p className="text-xs text-slate-500">$500/mo upgrade</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const MigrationWizard = () => {
  const [step, setStep] = useState(1);
  const steps = [
    { title: 'Source', desc: 'Select data source' },
    { title: 'Mapping', desc: 'Map fields' },
    { title: 'Preview', desc: 'Validate data' },
    { title: 'Import', desc: 'Run migration' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"
    >
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10"></div>
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
              step > i + 1 ? 'bg-green-500 text-white' : 
              step === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > i + 1 ? <CheckCircle size={18} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${step === i + 1 ? 'text-indigo-600' : 'text-slate-500'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
        {step === 1 && (
          <div className="space-y-4">
             <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 cursor-pointer transition-colors w-96 group">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-50">
                  <Globe className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                <h4 className="font-semibold text-slate-700">Connect via API</h4>
                <p className="text-xs text-slate-500">Import from external JSON/REST API</p>
             </div>
             <p className="text-xs text-slate-400">- OR -</p>
             <button className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200">Upload CSV</button>
          </div>
        )}
        {step > 1 && (
          <div className="text-slate-500">
             <p>Wizard Step {step} Implementation Placeholder</p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
        <button 
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-lg disabled:opacity-50"
        >
          Back
        </button>
        <button 
           onClick={() => setStep(Math.min(4, step + 1))}
           className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          {step === 4 ? 'Finish' : 'Continue'} <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const WebhookDashboard = () => {
  const webhooks = [
    { id: 'wh_1', url: 'https://api.myapp.com/events', events: ['user.created'], status: 'active', failures: 0 },
    { id: 'wh_2', url: 'https://hooks.slack.com/services/...', events: ['billing.failed'], status: 'failed', failures: 12 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
         <h3 className="font-bold text-slate-800">Active Webhooks</h3>
         <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
           + Add Endpoint
         </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Endpoint URL</th>
              <th className="px-6 py-3">Events</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {webhooks.map(wh => (
              <tr key={wh.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-600">{wh.url}</td>
                <td className="px-6 py-4">
                  {wh.events.map(e => (
                    <span key={e} className="inline-block px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 mr-2">{e}</span>
                  ))}
                </td>
                <td className="px-6 py-4">
                  {wh.status === 'active' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-600 font-medium">
                      <AlertTriangle size={12} /> Failed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">Test</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
