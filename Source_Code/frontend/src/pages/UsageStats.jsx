import React from 'react';

const UsageStats = ({ used, max }) => {
  // Hitung persentase penggunaan
  const percentage = Math.min((used / max) * 100, 100);
  
  // Tentukan warna berdasarkan tingkat penggunaan
  const getBarColor = () => {
    if (percentage >= 90) return 'bg-red-500'; // Hampir habis/Habis
    if (percentage >= 70) return 'bg-yellow-500'; // Peringatan
    return 'bg-indigo-600'; // Normal
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Penggunaan AI Tim
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {used} <span className="text-gray-400 text-lg font-normal">/ {max}</span>
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {percentage >= 90 && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2">
          <span className="text-red-600">⚠️</span>
          <p className="text-xs text-red-700 leading-tight">
            Kuota AI tim Anda hampir habis. Segera upgrade paket untuk terus menggunakan fitur ini.
          </p>
        </div>
      )}

      <button className="mt-4 w-full py-2 px-4 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
        Upgrade Plan
      </button>
    </div>
  );
};

export default UsageStats;