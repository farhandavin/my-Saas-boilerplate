'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

function JoinTeamContent() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invalidInvite, setInvalidInvite] = useState('');
  const [inviteInfo, setInviteInfo] = useState<{
    teamName: string;
    role: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    fetchInviteInfo();
  }, [token]);

  const fetchInviteInfo = async () => {
    try {
      const res = await fetch(`/api/team/join/${token}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setInviteInfo(data);
    } catch (err: any) {
      setInvalidInvite(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      router.push(`/auth?redirect=/join-team/${token}`);
      return;
    }

    setJoining(true);

    try {
      const res = await fetch(`/api/team/join/${token}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/dashboard?joined=${data.teamName}`);
    } catch (err: any) {
      showError(err.message || 'Gagal bergabung ke tim. Silakan coba lagi.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (invalidInvite) {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Undangan Tidak Valid</h2>
        <p className="text-gray-500 mb-6">{invalidInvite}</p>
        <Link
          href="/"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Bergabung ke Tim
      </h2>
      
      <p className="text-gray-500 mb-6">
        Anda diundang untuk bergabung ke tim <strong className="text-gray-900">{inviteInfo?.teamName}</strong> sebagai <span className="capitalize">{inviteInfo?.role?.toLowerCase()}</span>
      </p>

      <button
        onClick={handleJoin}
        disabled={joining}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
      >
        {joining ? 'Bergabung...' : 'Terima Undangan'}
      </button>

      <p className="text-gray-400 text-sm mt-4">
        Undangan untuk: {inviteInfo?.email}
      </p>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <JoinTeamContent />
      </Suspense>
    </div>
  );
}
