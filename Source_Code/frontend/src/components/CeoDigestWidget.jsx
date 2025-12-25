// src/components/CeoDigestWidget.jsx
import React, { useState } from 'react';
import { Briefcase, Sparkles, RefreshCw } from 'lucide-react';
// Pastikan path import api Anda benar sesuai struktur folder
import { paymentService } from '../services/api'; // Atau import instance axios langsung jika belum ada service khusus AI
import axios from 'axios'; 

// Jika Anda belum punya service khusus AI di api.js, kita pakai axios instance manual atau import yang ada
// Asumsi: Anda mengimport instance 'api' dari '../services/api'
import api from '../services/api'; 
import ReactMarkdown from 'react-markdown';

const CeoDigestWidget = ({ teamId }) => {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const generateDigest = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      // Panggil endpoint generateContent
      const res = await api.post('/ai/generate', {
        teamId,
        templateId: 'ceo-digest',
        inputData: { topic: "Generate Daily Report" } // Dummy input agar validasi tidak error
      });

      setDigest(res.data.data); 
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Gagal membuat digest", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-xl overflow-hidden text-white relative border border-indigo-700/50 mb-8">
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <div className="p-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm shadow-inner border border-white/5">
              <Briefcase className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">CEO Morning Digest</h3>
              <p className="text-xs text-indigo-200 opacity-70">AI-Powered Intelligence Summary</p>
            </div>
          </div>
          
          {/* Action Button */}
          <button 
            onClick={generateDigest}
            disabled={loading}
            className="group flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/40 transition-all px-4 py-2 rounded-xl backdrop-blur-md border border-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform"/>}
            <span className="text-xs font-bold tracking-wide">{loading ? 'Analyzing Data...' : 'Generate Brief'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[140px] bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm shadow-inner">
          
          {!digest && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-60">
              <span className="text-4xl mb-3 grayscale opacity-50">☕</span>
              <p className="text-sm font-medium text-indigo-100">Siap untuk rangkuman aktivitas hari ini?</p>
              <p className="text-xs text-indigo-300 mt-1 max-w-xs mx-auto">AI akan menganalisa log keamanan, penggunaan kredit, dan aktivitas tim dalam 24 jam terakhir.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse py-2">
              <div className="flex gap-2 items-center">
                 <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                 <div className="h-2.5 bg-white/10 rounded-full w-1/3"></div>
              </div>
              <div className="h-2 bg-white/10 rounded-full w-3/4"></div>
              <div className="h-2 bg-white/10 rounded-full w-5/6"></div>
              <div className="h-2 bg-white/10 rounded-full w-1/2"></div>
            </div>
          )}

          {digest && (
            <div className="prose prose-invert prose-sm max-w-none text-indigo-100 leading-relaxed">
              <ReactMarkdown>{digest}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {lastUpdated && (
          <div className="mt-4 flex justify-between items-center text-[10px] text-indigo-300 opacity-50">
            <span>Source: Internal Secured Audit Logs</span>
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default CeoDigestWidget;