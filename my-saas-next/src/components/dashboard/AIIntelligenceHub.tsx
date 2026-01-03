"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, Bot, FileText, CheckCircle, AlertCircle, File, X, ArrowRight } from 'lucide-react';

export const AIIntelligenceHub = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'vault' | 'precheck'>('vault');

  return (
    <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-sm border border-border dark:border-border-dark overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="border-b border-border dark:border-border-dark p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Intelligence Hub
          </h2>
          <p className="text-sm text-text-sub">Central nervous system for your business operations</p>
        </div>
        
        <div className="flex bg-background dark:bg-background-dark p-1 rounded-xl">
          {[
            { id: 'vault', label: 'Knowledge Vault', icon: <FileText className="w-4 h-4" /> },
            { id: 'chat', label: 'Chat with Data', icon: <Search className="w-4 h-4" /> },
            { id: 'precheck', label: 'Pre-check', icon: <CheckCircle className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-surface dark:bg-surface-dark text-primary dark:text-white shadow-sm' 
                  : 'text-text-sub hover:text-foreground dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-background dark:bg-background-dark">
        <AnimatePresence mode="wait">
          {activeTab === 'vault' && (
            <KnowledgeVault key="vault" />
          )}
          {activeTab === 'chat' && (
            <ChatInterface key="chat" />
          )}
          {activeTab === 'precheck' && (
            <PreCheckDropzone key="precheck" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Sub-components
const KnowledgeVault = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="border-2 border-dashed border-border dark:border-border-dark rounded-xl p-8 text-center bg-surface dark:bg-surface-dark transition-colors hover:border-primary/50">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">Upload SOPs & Documents</h3>
        <p className="text-text-sub mb-6 max-w-md mx-auto">
          Drag and drop PDF, DOCX, or TXT files here to train your AI.
          The more you upload, the smarter it gets.
        </p>
        <button className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors">
          Select Files
        </button>
      </div>

      <div className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-border dark:border-border-dark bg-background dark:bg-background-dark flex justify-between">
          <h4 className="font-semibold text-text-sub dark:text-slate-200">Knowledge Base Content</h4>
          <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">System Ready</span>
        </div>
        <div className="divide-y divide-border dark:divide-border-dark">
          {[
            // { name: 'Employee Handbook 2024.pdf', size: '2.4 MB', date: 'Just now', status: 'Training...' },
            // { name: 'Q4 Financial Report.xlsx', size: '1.1 MB', date: '2 hours ago', status: 'Indexed' },
            // { name: 'Project Phoenix Specs.docx', size: '840 KB', date: 'Yesterday', status: 'Indexed' },
          ].length > 0 ? (
            [].map((file: any, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-background dark:hover:bg-slate-800/30 transition-colors">
                {/* Existing item render logic would go here if we had items */}
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-text-sub">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No documents uploaded yet</p>
              <p className="text-xs mt-1">Upload PDF, DOCX, or TXT files to start training.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChatInterface = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-[500px]"
    >
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        <div className="flex gap-4">
          <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="bg-surface dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none border border-border dark:border-border-dark text-foreground dark:text-slate-200 text-sm shadow-sm">
              <p>Hello! I have full access to your internal documentation. Ask me anything about your SOPs, financial reports, or project specs.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-row-reverse">
          <div className="w-8 h-8 bg-background dark:bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold text-text-sub">ME</span>
          </div>
          <div className="space-y-2">
            <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none text-sm shadow-md">
              <p>What is the procedure for approving expenses over $10k?</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <div className="bg-surface dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none border border-border dark:border-border-dark text-foreground dark:text-slate-200 text-sm shadow-sm">
              <p>According to the <span className="text-primary font-medium cursor-pointer hover:underline">Financial SOP 2024 (Section 3.2)</span>:</p>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Expenses &gt; $10k require <strong>VP of Finance approval</strong>.</li>
                <li>Must be submitted via Form 10-K at least 5 days in advance.</li>
                <li>Attached vendor risk assessment is mandatory.</li>
              </ul>
            </div>
            <div className="text-xs text-text-sub pl-2">
              Source: Financial SOP 2024.pdf (Page 12)
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Ask a question about your data..." 
          className="w-full pl-4 pr-12 py-3 bg-surface dark:bg-surface-dark border border-input-border dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-foreground"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const PreCheckDropzone = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col items-center justify-center"
    >
       <div className="w-full max-w-2xl bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground dark:text-white">AI Compliance Pre-check</h3>
            <p className="text-text-sub mt-2">
              Upload contracts or reports to automatically check against company policies before submission.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark">
              <p className="text-sm font-semibold text-foreground dark:text-slate-300 mb-2">Checks for:</p>
              <ul className="text-sm text-text-sub space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> PII Violations</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Policy Compliance</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> Formatting Errors</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-border dark:border-border-dark flex flex-col items-center justify-center text-center hover:bg-background transition-colors cursor-pointer group">
              <Upload className="w-6 h-6 text-text-sub group-hover:text-primary mb-2 transition-colors" />
              <p className="text-sm font-medium text-text-sub group-hover:text-foreground">Drop file to scan</p>
            </div>
          </div>
       </div>
    </motion.div>
  );
};
