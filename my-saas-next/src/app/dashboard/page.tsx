'use client'; // Client Component karena butuh interaksi

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import CeoDigestWidget from '@/components/CeoDigestWidget'; // Nanti kita buat

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Cek token (Sederhana)
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else setUser({ name: "User" }); // Idealnya fetch /api/auth/me
  }, []);

  if (!user) return <div className="p-10">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget AI */}
        <CeoDigestWidget />
        
        {/* Widget Billing Placeholder */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-gray-700">Token Balance</h3>
          <p className="text-2xl font-bold text-indigo-600 mt-2">750 / 1000</p>
        </div>
      </div>
    </div>
  );
}