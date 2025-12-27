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
        { prompt: "Buatkan rangkuman performa bisnis hari ini." },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
    } catch (error) {
      alert("Gagal memproses AI");
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
        {result ? <p className="whitespace-pre-line">{result}</p> : <p className="text-gray-400 italic">Klik refresh untuk analisa...</p>}
      </div>
    </div>
  );
}