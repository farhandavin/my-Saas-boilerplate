// frontend/src/components/CeoDigestWidget.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CeoDigestWidget = () => {
  const { team } = useAuth();
  const [digest, setDigest] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null); // Data mentah (Revenue dll)

  // Hanya OWNER yang bisa akses fitur ini
  const isOwner = team?.role === 'OWNER';

  const fetchDigest = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/ceo-digest');
      setDigest(res.data.data.digest); // Teks dari AI
      setStats(res.data.data.rawData); // Data angka mentah
    } catch (error) {
      console.error("Failed to fetch digest:", error);
      setDigest("Gagal mengambil analisa AI. Pastikan kuota Anda cukup.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
        <p className="text-gray-500">🔒 Widget ini khusus untuk Owner Bisnis (CEO Digest).</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">☕ CEO Morning Digest</h2>
          <p className="text-sm text-gray-500">Analisa strategis harian oleh AI</p>
        </div>
        <button 
          onClick={fetchDigest} 
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Menganalisa..." : "Refresh Insight"}
        </button>
      </div>

      {/* Bagian 1: Data Mentah (Sekilas) */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-semibold">REVENUE</p>
            <p className="text-lg font-bold text-gray-800">{stats.financial.totalRevenue}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-semibold">NEW USERS</p>
            <p className="text-lg font-bold text-gray-800">+{stats.userGrowth.newSignups}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 font-semibold">ISSUES</p>
            <p className="text-lg font-bold text-gray-800">{stats.operational.errorLogs} Logs</p>
          </div>
        </div>
      )}

      {/* Bagian 2: Analisa AI (Markdown-like text) */}
      <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-xl">
        {digest ? (
          <div className="whitespace-pre-line leading-relaxed">
            {digest}
          </div>
        ) : (
          <p className="text-gray-400 italic">Klik tombol "Refresh" untuk meminta AI menganalisa performa bisnis hari ini...</p>
        )}
      </div>
    </div>
  );
};

export default CeoDigestWidget;