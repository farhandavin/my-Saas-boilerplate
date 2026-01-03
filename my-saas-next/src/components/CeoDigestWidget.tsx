'use client';

import { useState } from 'react';
import axios from 'axios';

export default function CeoDigestWidget() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/analyze', 
        { 
          prompt: `You are a Chief of Staff. Analyze this daily snapshot and give a 3-bullet executive summary (Growth, Critical, Highlight).
          
          Context Data:
          - Daily Revenue: $15,420 (+12% wow)
          - Active Users: 1,205 (+5%)
          - Top Anomaly: unusually high signup rate from Japan region.
          - System Health: All green, except increased latency in payments API.
          
          Tone: Professional, Concise, Insightful.` 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
    } catch (error) {
      alert("Failed to process AI request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">☕ CEO Digest</h2>
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Refresh"}
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-xl min-h-[100px]">
        {result ? <p className="whitespace-pre-line">{result}</p> : <p className="text-gray-400 italic">Click refresh to analyze...</p>}
      </div>
    </div>
  );
}