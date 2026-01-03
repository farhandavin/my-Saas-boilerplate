'use client';

export function TrustScoreCard({ score, totalChecks, passedChecks }: { score: number, totalChecks: number, passedChecks: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-600 dark:text-green-400';
    if (s >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRingColor = (s: number) => {
      if (s >= 90) return 'stroke-green-600 dark:stroke-green-500';
      if (s >= 70) return 'stroke-amber-500 dark:stroke-amber-500';
      return 'stroke-red-500 dark:stroke-red-500';
  }

  // Radial progress calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-[#1a2632] rounded-xl p-8 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${score >= 70 ? (score >= 90 ? 'green' : 'amber') : 'red'}-500 to-transparent opacity-50`}></div>
        
        <div className="relative size-40 mb-4">
            <svg className="size-full transform -rotate-90">
                <circle
                    className="text-gray-100 dark:text-slate-800"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                />
                <circle
                    className={`${getRingColor(score)} transition-all duration-1000 ease-out`}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getColor(score)}`}>{score}</span>
                <span className="text-xs text-gray-400 uppercase font-semibold mt-1">Score</span>
            </div>
        </div>

        <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security Status</h3>
            <p className="text-sm text-gray-500 mt-1">{passedChecks} / {totalChecks} checks passed</p>
        </div>
    </div>
  );
}
