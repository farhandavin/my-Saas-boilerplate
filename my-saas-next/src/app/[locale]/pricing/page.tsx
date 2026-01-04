'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceId: string; // Stripe Price ID
  period: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    priceId: '', // No Stripe for free
    period: 'forever',
    features: [
      '500 AI tokens/month',
      '1 team member',
      'Basic analytics',
      'Community support'
    ],
    cta: 'Current Plan'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 299000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_xxx',
    period: 'month',
    features: [
      '50,000 AI tokens/month',
      'Up to 10 team members',
      'Advanced analytics & reports',
      'Priority email support',
      'API access',
      'Audit logs'
    ],
    popular: true,
    cta: 'Upgrade to Pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_yyy',
    period: 'month',
    features: [
      '500,000 AI tokens/month',
      'Unlimited team members',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment option',
      'SSO & advanced security'
    ],
    cta: 'Contact Sales'
  }
];

export default function PricingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: PricingPlan) => {
    if (plan.id === 'free') return;
    if (plan.id === 'enterprise') {
      // Redirect to contact form
      router.push('/contact?plan=enterprise');
      return;
    }

    try {
      setLoading(plan.id);
      
      // Get team ID from user's team (using cookie-based auth)
      const teamRes = await fetch('/api/team', {
        credentials: 'include'
      });
      
      if (!teamRes.ok) {
        showError('Please login first to upgrade your plan.');
        setLoading(null);
        router.push('/auth');
        return;
      }
      
      const teamData = await teamRes.json();
      const teamId = teamData.teams?.[0]?.id;

      if (!teamId) {
        showError('No team found. Please create a team first.');
        setLoading(null);
        return;
      }

      // Create checkout session
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          teamId,
          planType: plan.id.toUpperCase()
        })
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        showError(data.error || 'Failed to create checkout session');
        setLoading(null);
      }
    } catch (error) {
      showError('Something went wrong');
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0a0f1a] dark:to-[#101922]">
      
      {/* Header */}
      <div className="text-center pt-16 pb-12 px-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the plan that fits your business. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white dark:bg-[#1a2332] rounded-2xl border-2 p-8 flex flex-col ${
                plan.popular 
                  ? 'border-[#135bec] shadow-xl shadow-blue-500/10' 
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#135bec] text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-emerald-500 text-[20px] mt-0.5">check_circle</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={loading === plan.id || plan.id === 'free'}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-[#135bec] text-white hover:bg-[#0b46b9] shadow-lg shadow-blue-500/30'
                    : plan.id === 'free'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                }`}
              >
                {loading === plan.id && (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                )}
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ or Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Secure payment powered by
          </p>
          <div className="flex justify-center items-center gap-8 opacity-50">
            <span className="text-2xl font-bold text-gray-400">Stripe</span>
            <span className="text-sm text-gray-400">256-bit SSL</span>
            <span className="text-sm text-gray-400">PCI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
