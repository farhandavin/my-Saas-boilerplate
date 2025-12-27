'use client'; // Wajib untuk komponen yang pakai useState/useEffect

import { useState } from 'react';
import axios from 'axios';

interface FinancialStats {
  totalRevenue: string;
  expense: string;
  profitMargin: string;
}

interface DigestData {
  digest: string;
  rawData: {
    financial: FinancialStats;
    userGrowth: any;
    operational: any;
  };
}

export default function CeoDigestWidget() {
  const [data, setData] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDigest = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/ai/ceo-digest'); // Call Internal API
      setData(res.data.data);
    } catch (error) {
      console.error("Failed to fetch digest", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">☕ CEO Morning Digest</h2>
        <button 
          onClick={fetchDigest}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Refresh Insight"}
        </button>
      </div>

      {data && (
        <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-xl whitespace-pre-line">
          {data.digest}
        </div>
      )}
    </div>
  );
}