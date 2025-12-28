'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: 'Rp 0',
    period: '/bulan',
    description: 'Untuk mencoba fitur dasar',
    features: [
      '2 anggota tim',
      '500 token AI/bulan',
      'Knowledge base dasar',
      'Support via email'
    ],
    priceId: null,
    popular: false
  },
  {
    name: 'Pro',
    price: 'Rp 299.000',
    period: '/bulan',
    description: 'Untuk tim yang berkembang',
    features: [
      '10 anggota tim',
      '50.000 token AI/bulan',
      'RAG dokumen unlimited',
      'Priority support',
      'API Access',
      'Audit logs'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Untuk perusahaan besar',
    features: [
      'Unlimited anggota',
      '500.000+ token AI/bulan',
      'Dedicated database',
      'SSO & compliance',
      '24/7 support',
      'Custom integrations'
    ],
    priceId: null,
    popular: false
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string | null, planName: string) => {
    if (!priceId) {
      if (planName === 'Enterprise') {
        window.location.href = 'mailto:sales@yourdomain.com?subject=Enterprise Plan Inquiry';
      }
      return;
    }

    setLoading(planName);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login?redirect=/pricing');
        return;
      }

      // Get user's team first
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await meRes.json();

      if (!meRes.ok) {
        router.push('/auth/login?redirect=/pricing');
        return;
      }

      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          priceId,
          teamId: meData.activeTeam?.id,
          planType: planName.toUpperCase()
        })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          SaaSName
        </Link>
        <Link 
          href="/auth/login"
          className="px-5 py-2 text-white/80 hover:text-white transition-colors"
        >
          Login
        </Link>
      </nav>

      {/* Hero */}
      <div className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Pilih Plan yang Tepat untuk Tim Anda
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Semua plan termasuk akses ke fitur AI canggih. Upgrade kapan saja.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b from-purple-600 to-indigo-700 ring-2 ring-purple-400 scale-105'
                  : 'bg-white/10 backdrop-blur-lg border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-black text-sm font-semibold rounded-full">
                  Paling Populer
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-white/60 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-white/60">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-white text-purple-700 hover:bg-white/90'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                } disabled:opacity-50`}
              >
                {loading === plan.name ? 'Memproses...' : plan.priceId ? 'Upgrade Sekarang' : plan.name === 'Enterprise' ? 'Hubungi Sales' : 'Current Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="container mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Pertanyaan Umum
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">Apa itu token AI?</h3>
            <p className="text-white/60 text-sm">
              Token adalah unit pengukuran penggunaan AI. Setiap permintaan ke AI kami menggunakan sejumlah token tergantung kompleksitasnya.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">Bisa cancel kapan saja?</h3>
            <p className="text-white/60 text-sm">
              Ya! Anda bisa membatalkan langganan kapan saja. Akses akan tetap aktif sampai akhir periode billing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
