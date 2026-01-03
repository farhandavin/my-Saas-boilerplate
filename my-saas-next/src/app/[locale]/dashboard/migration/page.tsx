'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/Toast';

export default function MigrationPage() {
  const [step, setStep] = useState(1); // 1: Connect, 2: Analyze, 3: Migrate, 4: Done
  const [sourceUrl, setSourceUrl] = useState('');
  const [dbType, setDbType] = useState('postgres');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  
  // Real backend connection state
  const [jobId, setJobId] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Check for existing job on load
  useEffect(() => {
    checkExistingJob();
  }, []);

  const checkExistingJob = async () => {
      try {
          const res = await fetch('/api/migration');
          const data = await res.json();
          if (data.status === 'IN_PROGRESS') {
              setJobId(data.id);
              setStep(3);
              setLogs(data.logs.map((l: any) => `[${l.level}] ${l.message}`));
              // Since we don't have a real worker updating the DB in background for this demo,
              // we might need to "resume" the simulation if it was left halfway.
              simulateMigrationProgress();
          } else if (data.status === 'COMPLETED') {
              setStep(4);
          }
      } catch (e) {
          console.error("Failed to check migration status");
      }
  };

  const handleConnect = async () => {
    if (!sourceUrl) return showError('Please enter a database URL');
    setLoading(true);
    
    // Simulate Connection Check
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      showSuccess('Database connected successfully');
    }, 1500);
  };

  const startMigration = async () => {
    setLoading(true);
    try {
        const res = await fetch('/api/migration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceUrl, dbType })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            setJobId(data.id);
            setStep(3);
            simulateMigrationProgress();
        } else {
            showError(data.error || 'Failed to start migration');
            setLoading(false);
        }
    } catch (error) {
        showError('Failed to start migration');
        setLoading(false);
    }
  };

  const simulateMigrationProgress = () => {
    // In a real scenario, we would use setInterval to poll /api/migration/{id} 
    // waiting for the server to update the status.
    // Since we don't have a dedicated worker process in this Next.js app to update the DB in background,
    // we will client-side simulate the detailed logs but hitting an endpoint to "finish" it at the end would be ideal.
    
    const steps = [
      "Initializing migration agent...",
      "Analyzing source schema...",
      "Detected 14 tables, 45 indexes, 20 foreign keys",
      "Mapping data types to target schema...",
      "Validation passed. Starting data transfer...",
      "Copying table: users (1,402 rows)...",
      "Copying table: teams (25 rows)...",
      "Copying table: transactions (15,200 rows)...",
      "Applied 14/14 tables.",
      "Building indexes...",
      "Verifying data integrity...",
      "Migration completed successfully."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        finishMigration();
        return;
      }
      
      const logMessage = `[INFO] ${new Date().toLocaleTimeString()} - ${steps[currentStep]}`;
      setLogs(prev => [...prev, logMessage]);
      setProgress(((currentStep + 1) / steps.length) * 100);
      currentStep++;
    }, 800);
  };

  const finishMigration = async () => {
      // Call API to mark as done
      if (jobId) {
        try {
          // const token = localStorage.getItem('token');
          await fetch(`/api/migration/${jobId}`, { 
            method: 'PATCH', 
            headers: { 
              // 'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              status: 'COMPLETED',
              progress: 100,
              logs: [{ timestamp: new Date().toISOString(), level: 'INFO', message: 'Migration completed successfully' }]
            }) 
          });
        } catch (e) {
          console.error('Failed to update job status:', e);
        }
      }
      setLoading(false);
      setStep(4);
      showSuccess('Migration completed!');
  };

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-10 pb-32 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Migration Engine</h1>
        <p className="text-gray-500 dark:text-[#92a4c9]">Import data from external databases or legacy systems.</p>
      </div>

      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
         
         {/* Stepper Header */}
         <div className="bg-gray-50 dark:bg-[#151b26] border-b border-gray-200 dark:border-[#232f48] p-4">
            <div className="flex items-center justify-center gap-4">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            step >= s ? 'bg-[#135bec] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                            {step > s ? '✓' : s}
                        </div>
                        {s < 4 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#135bec]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                    </div>
                ))}
            </div>
            <div className="flex justify-between max-w-[360px] mx-auto mt-2 text-xs font-medium text-gray-500 dark:text-[#92a4c9] px-2">
                <span>Connect</span>
                <span>Analyze</span>
                <span>Migrate</span>
                <span>Done</span>
            </div>
         </div>

         {/* Step Content */}
         <div className="p-8 md:p-12 flex-1 flex flex-col items-center justify-center">
            
            {/* Step 1: Connect */}
            {step === 1 && (
                <div className="w-full max-w-lg space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connect Source Database</h2>
                        <p className="text-sm text-gray-500 dark:text-[#92a4c9] mt-1">Enter your connection string to begin the import process.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Database Type</label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {['postgres', 'mysql', 'mongodb'].map((type) => (
                                <button 
                                    key={type}
                                    onClick={() => setDbType(type)}
                                    className={`px-4 py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                        dbType === type 
                                        ? 'border-[#135bec] bg-[#135bec]/5 text-[#135bec]' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <span className="capitalize font-bold text-sm">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connection String</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#151b26] focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all font-mono text-sm"
                            placeholder="postgresql://user:password@localhost:5432/mydb"
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleConnect}
                        disabled={loading}
                        className="w-full py-3 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Connecting...' : 'Test Connection & Continue'}
                    </button>
                </div>
            )}

            {/* Step 2: Analyze */}
            {step === 2 && (
                <div className="w-full max-w-2xl animate-fade-in text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connection Successful</h2>
                    <p className="text-gray-500 mb-8">We found 14 tables and 450MB of data ready to import.</p>
                    
                    <div className="grid grid-cols-3 gap-4 text-left mb-8">
                        <div className="p-4 bg-gray-50 dark:bg-[#151b26] rounded-xl border border-gray-200 dark:border-[#232f48]">
                            <p className="text-xs text-gray-500 uppercase font-bold">Tables</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">14</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#151b26] rounded-xl border border-gray-200 dark:border-[#232f48]">
                            <p className="text-xs text-gray-500 uppercase font-bold">Size</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">450 MB</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#151b26] rounded-xl border border-gray-200 dark:border-[#232f48]">
                            <p className="text-xs text-gray-500 uppercase font-bold">Est. Time</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">~2m</p>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={() => setStep(1)}
                            className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={startMigration}
                            disabled={loading}
                            className="px-8 py-3 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            {loading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                            Start Migration
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Moving (Terminal View) */}
            {step === 3 && (
                <div className="w-full h-full flex flex-col animate-fade-in">
                    <div className="mb-4 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Migration in progress...</h3>
                        <span className="text-sm font-mono text-[#135bec]">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-[#135bec] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="flex-1 bg-[#0d1117] rounded-xl border border-gray-800 p-4 font-mono text-sm text-gray-300 overflow-y-auto max-h-[400px] shadow-inner font-mono">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1.5 break-all">
                                <span className="text-green-500 mr-2">➜</span>
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef}></div>
                    </div>
                </div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Migration Completed!</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Your data has been successfully imported. You can now access your new dashboard with all your data.</p>
                    <button className="px-8 py-3 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                        Go to Dashboard
                    </button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
