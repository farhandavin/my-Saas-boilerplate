import { useState } from 'react';
import Link from 'next/link';
import { InvoiceList } from '@/components/dashboard/InvoiceList';

interface Team {
  id: string;
  name: string;
  tier: string;
  aiUsageCount: number;
  aiTokenLimit: number;
}

interface BillingTabProps {
  team: Team | null;
}

export const BillingTab = ({ team }: BillingTabProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePortal = async () => {
    setLoading('portal');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payment/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamId: team?.id })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Plan 💳</h2>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Plan Saat Ini</h3>
            <p className="text-gray-500">Tim: {team?.name}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            team?.tier === 'PRO' 
              ? 'bg-purple-100 text-purple-700' 
              : team?.tier === 'ENTERPRISE'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {team?.tier || 'FREE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">AI Token Limit</p>
            <p className="text-2xl font-bold text-gray-900">{team?.aiTokenLimit?.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Used This Month</p>
            <p className="text-2xl font-bold text-gray-900">{team?.aiUsageCount?.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/pricing"
            className="flex-1 py-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            {team?.tier === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
          </Link>
          
          {team?.tier !== 'FREE' && (
            <button
              onClick={handlePortal}
              disabled={loading === 'portal'}
              className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {loading === 'portal' ? 'Loading...' : 'Manage Billing'}
            </button>
          )}
        </div>
      </div>

       <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Invoice History</h3>
        <InvoiceList />
       </div>
    </div>
  );
};
