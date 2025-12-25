import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Database } from 'lucide-react'; // Pastikan install lucide-react atau ganti icon lain
import api from '../services/api';
import { useTeamQuery, useCreateCheckout } from "../hooks/queries/useQueries";
import { toast } from 'react-hot-toast'; // Asumsi pakai react-hot-toast

const Pricing = () => {
  const { data: team } = useTeamQuery();
  const [loading, setLoading] = useState(null);
  const navigate = useNavigate();

  const handleSubscribe = async (planType) => {
    if (!team) return;
    setLoading(planType);

    try {
      // Panggil backend untuk dapatkan URL Stripe
      const { url } = await api.createCheckoutSession(team.id, planType);
      
      // Redirect user ke halaman pembayaran Stripe
      if (url) window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghubungkan ke pembayaran.");
      setLoading(null);
    }
  };

  const currentPlan = team?.plan || 'Free';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Monetization & Scale</h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Pilih Tingkat Keamanan Data Anda
        </p>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Upgrade infrastruktur bisnis Anda dari database bersama (Shared) menjadi infrastruktur terisolasi (Dedicated) tanpa downtime.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-3 items-start">
        
        {/* --- FREE TIER --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900">Starter</h3>
          <p className="mt-4 text-sm text-gray-500">Cocok untuk validasi ide dan tim kecil.</p>
          <div className="mt-6 flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">Rp 0</span>
            <span className="ml-1 text-xl font-semibold text-gray-500">/bulan</span>
          </div>
          <ul className="mt-6 space-y-4">
            <FeatureItem text="10 AI Credits / bulan" />
            <FeatureItem text="Shared Database Infrastructure" />
            <FeatureItem text="Komunitas Support" />
          </ul>
          <button
            disabled={true}
            className="mt-8 w-full bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-xl cursor-not-allowed"
          >
            Saat ini Aktif
          </button>
        </div>

        {/* --- PRO TIER --- */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 relative">
          <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
            Popular
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Pro Business</h3>
          <p className="mt-4 text-sm text-gray-500">Untuk bisnis yang sedang bertumbuh cepat.</p>
          <div className="mt-6 flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">Rp 299rb</span>
            <span className="ml-1 text-xl font-semibold text-gray-500">/bulan</span>
          </div>
          <ul className="mt-6 space-y-4">
            <FeatureItem text="500 AI Credits / bulan" icon={<Zap className="w-5 h-5 text-yellow-500"/>} />
            <FeatureItem text="Schema-Level Isolation (Lebih Cepat)" />
            <FeatureItem text="CEO Digest (Daily Report)" />
            <FeatureItem text="PII Masking Protection" />
          </ul>
          <button
            onClick={() => handleSubscribe('Pro')}
            disabled={loading || currentPlan === 'Pro'}
            className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            {loading === 'Pro' ? 'Processing...' : currentPlan === 'Pro' ? 'Paket Anda' : 'Upgrade ke Pro'}
          </button>
        </div>

        {/* --- ENTERPRISE TIER (KILLER FEATURE) --- */}
        <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8 transform scale-105 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-900 opacity-20 blur-3xl"></div>
          
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400"/> Enterprise
          </h3>
          <p className="mt-4 text-sm text-gray-400">Keamanan level Bank dengan Database Fisik Terpisah.</p>
          <div className="mt-6 flex items-baseline">
            <span className="text-4xl font-extrabold text-white">Rp 999rb</span>
            <span className="ml-1 text-xl font-semibold text-gray-500">/bulan</span>
          </div>
          
          <div className="my-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-gray-200">Dedicated Database Vault</span>
            </div>
            <p className="text-xs text-gray-400">
              Data Anda akan dimigrasikan secara fisik ke server terpisah. Zero interference dari user lain.
            </p>
          </div>

          <ul className="space-y-4">
            <FeatureItem text="Unlimited AI Credits (Pay-as-you-go)" dark />
            <FeatureItem text="Full Data Isolation (Physical DB)" dark />
            <FeatureItem text="Custom SLA & Support" dark />
            <FeatureItem text="Audit Logs Retention 1 Tahun" dark />
          </ul>

          <button
            onClick={() => handleSubscribe('Enterprise')}
            disabled={loading || currentPlan === 'Enterprise'}
            className={`mt-8 w-full font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2
              ${currentPlan === 'Enterprise' 
                ? 'bg-gray-700 text-gray-400 cursor-default' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white'}`}
          >
            {loading === 'Enterprise' ? 'Preparing Vault...' : currentPlan === 'Enterprise' ? 'Anda di Enterprise' : 'Migrasi ke Enterprise'}
          </button>
        </div>

      </div>
    </div>
  );
};

// Helper Component untuk List Item
const FeatureItem = ({ text, dark = false, icon }) => (
  <li className="flex items-start">
    <div className="flex-shrink-0">
      {icon || <Check className={`h-5 w-5 ${dark ? 'text-indigo-400' : 'text-green-500'}`} />}
    </div>
    <p className={`ml-3 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{text}</p>
  </li>
);

export default Pricing;