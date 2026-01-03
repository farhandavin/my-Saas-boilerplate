'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function BillingUsagePage() {
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  
  const [data, setData] = useState<any>({
    plan: { type: 'Free', price: 0, billingCycle: 'Monthly', nextBilling: '', status: 'active' },
    usage: { tokensUsed: 0, tokensLimit: 1000, costSoFar: 0, projectedCost: 0 },
    invoices: [],
    paymentMethod: { brand: '...', last4: '...', expiry: '...' },
    billingAddress: { street: '', city: '', state: '', postalCode: '', country: '' }
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/billing', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (res.ok) {
        setData(json);
      } else {
        showError(json.error || 'Failed to fetch billing info');
      }
    } catch (error) {
      showError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // const token = localStorage.getItem('token');
      
      // Get team ID
      const teamRes = await fetch('/api/team', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      const teamData = await teamRes.json();
      const teamId = teamData.teams?.[0]?.id;

      if (!teamId) {
        showError('No team found');
        return;
      }

      const res = await fetch('/api/payment/create-portal', {
        method: 'POST',
        headers: { 
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamId })
      });

      const result = await res.json();

      if (result.url) {
        window.location.href = result.url;
      } else {
        // If no Stripe customer yet, redirect to pricing
        window.location.href = '/pricing';
      }
    } catch (error) {
      showError('Failed to open subscription portal');
    }
  };

  const currentUsagePercent = Math.min(100, Math.round((data.usage.tokensUsed / data.usage.tokensLimit) * 100));

  // Payment Failure Logic
  const isPaymentFailed = data.plan.status === 'past_due' || data.plan.status === 'unpaid';

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto p-4 md:p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Loading billing details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 pb-32 animate-fade-in">
      
      {/* ALERT: Soft Lock State (Conditional) */}
      {isPaymentFailed && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start justify-between gap-4">
           <div>
             <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2">
               <span className="material-symbols-outlined">warning</span>
               Account Status: Soft Lock Active
             </h3>
             <p className="text-sm text-red-700 dark:text-red-300 mt-1">
               We couldn't process your last payment. To restore full access to AI features, please update your payment method.
             </p>
           </div>
           <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm whitespace-nowrap">
             Update Payment
           </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Usage</h1>
           <p className="text-gray-500 dark:text-[#92a4c9] mt-2">Manage your subscription, payment methods, and view usage history.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white dark:bg-[#1a2332] text-gray-700 dark:text-white border border-gray-200 dark:border-[#232f48] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#232f48] transition-colors">
              Contact Support
           </button>
           <button 
             onClick={handleManageSubscription}
             className="px-4 py-2 bg-[#135bec] text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
           >
              Manage Subscription
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Usage */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Current Plan Card */}
           <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-[#92a4c9] uppercase tracking-wider">Current Plan</p>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.plan.type} Tier</h2>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isPaymentFailed 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30' 
                      : 'bg-green-100 text-green-600 dark:bg-green-900/30'
                 }`}>
                    {isPaymentFailed ? 'Restricted' : data.plan.status}
                 </span>
              </div>
              
              <div className="flex items-end gap-1 mb-2">
                 <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${data.plan.price}</span>
                 <span className="text-gray-500 dark:text-gray-400 mb-1">/ {data.plan.billingCycle.toLowerCase()}</span>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Next billing date: <span className="text-gray-900 dark:text-white font-medium">{data.plan.nextBilling}</span></p>
              
              <div className="w-full bg-gray-100 dark:bg-[#151b26] h-1.5 rounded-full overflow-hidden mb-2">
                 <div className="bg-[#135bec] h-full rounded-full" style={{ width: `${Math.min(100, (30 - 5) / 30 * 100)}%` }}></div> 
              </div>
              <p className="text-xs text-center text-gray-400">25 days remaining in cycle</p>
           </div>

           {/* Usage Stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token Usage */}
              <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] p-6 shadow-sm">
                 <div className="flex items-start justify-between mb-4">
                     <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <span className="material-symbols-outlined">token</span>
                     </div>
                     <span className="text-xs font-bold text-gray-400 uppercase">Monthly Limit</span>
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{data.usage.tokensUsed.toLocaleString()}</h3>
                 <p className="text-sm text-gray-500 dark:text-[#92a4c9] mb-4">of {data.usage.tokensLimit.toLocaleString()} tokens used</p>
                 
                 <div className="w-full bg-gray-100 dark:bg-[#151b26] h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                        currentUsagePercent > 90 ? 'bg-red-500' : 'bg-indigo-500'
                    }`} style={{ width: `${currentUsagePercent}%` }}></div>
                 </div>
                 <div className="flex justify-between mt-2 text-xs font-medium">
                     <span className="text-gray-600 dark:text-gray-400">{currentUsagePercent}% Consumed</span>
                     {currentUsagePercent > 90 && <span className="text-red-500">Approaching Limit</span>}
                 </div>
              </div>

               {/* Spend */}
               <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] p-6 shadow-sm">
                 <div className="flex items-start justify-between mb-4">
                     <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined">attach_money</span>
                     </div>
                     <span className="text-xs font-bold text-gray-400 uppercase">Current Spend</span>
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">${data.usage.costSoFar.toFixed(2)}</h3>
                 <p className="text-sm text-gray-500 dark:text-[#92a4c9] mb-4">Projected: ${data.usage.projectedCost.toFixed(2)}</p>
                 
                 {isPaymentFailed && (
                     <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/30">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        Payment Overdue
                     </div>
                 )}
              </div>
           </div>

           {/* Invoice History */}
           <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#232f48] flex justify-between items-center">
                 <h3 className="font-bold text-gray-900 dark:text-white">Invoice History</h3>
                 <button className="text-sm text-[#135bec] font-medium hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-[#151b26] text-xs font-semibold text-gray-500 uppercase tracking-wider">
                       <tr>
                          <th className="px-6 py-3">Invoice</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#232f48]">
                       {data.invoices.length === 0 ? (
                           <tr>
                               <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No invoices found.</td>
                           </tr>
                       ) : (
                           data.invoices.map((inv: any, i: number) => (
                              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#232f48]/50 transition-colors">
                                 <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{inv.id.substring(0, 8)}</td>
                                 <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{inv.date}</td>
                                 <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${inv.amount.toFixed(2)}</td>
                                 <td className="px-6 py-4">
                                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                         inv.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                         inv.status === 'UNPAID' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200' :
                                         'bg-red-100 text-red-700 dark:bg-red-900/30'
                                     }`}>
                                         {inv.status === 'failed' && <span className="material-symbols-outlined text-[14px]">warning</span>}
                                         {inv.status}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <button className="text-gray-400 hover:text-[#135bec] transition-colors"><span className="material-symbols-outlined">download</span></button>
                                 </td>
                              </tr>
                           ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right Column: Payment Details */}
        <div className="space-y-6">
           
           {/* Payment Method */}
           <div className={`rounded-2xl border p-6 shadow-sm ${
               isPaymentFailed 
                 ? 'bg-red-50 dark:bg-red-900/5 border-red-200 dark:border-red-900/30' 
                 : 'bg-white dark:bg-[#1a2332] border-gray-200 dark:border-[#232f48]'
           }`}>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-900 dark:text-white">Payment Method</h3>
                 <button className="text-sm text-[#135bec] font-bold hover:underline">Update</button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-8 bg-white dark:bg-[#232f48] border border-gray-200 dark:border-gray-600 rounded flex items-center justify-center text-xs font-bold italic text-blue-800 dark:text-blue-400">
                    {data.paymentMethod.brand}
                 </div>
                 <div>
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300">•••• •••• •••• {data.paymentMethod.last4}</p>
                    {isPaymentFailed ? (
                        <p className="text-xs text-red-600 font-bold mt-0.5">Payment Failed</p>
                    ) : (
                        <p className="text-xs text-gray-500">Expires {data.paymentMethod.expiry}</p>
                    )}
                 </div>
              </div>
              
              {isPaymentFailed && (
                   <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-900/30">
                       <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">Recovery Process</h4>
                       <div className="space-y-2">
                           <div className="flex gap-2 text-xs text-red-600/80">
                               <span className="material-symbols-outlined text-[14px]">schedule</span>
                               <span>Next retry: Tomorrow at 10:00 AM</span>
                           </div>
                           <div className="flex gap-2 text-xs text-red-600/80">
                               <span className="material-symbols-outlined text-[14px]">history</span>
                               <span>Reason: Insufficient Funds</span>
                           </div>
                       </div>
                   </div>
              )}
           </div>

           {/* Billing Address */}
           <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-900 dark:text-white">Billing Details</h3>
                 <button className="text-sm text-[#135bec] font-bold hover:underline">Edit</button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                 <p className="text-gray-900 dark:text-white font-medium">{data.plan.type} User</p>
                 <p>{data.billingAddress?.street}</p>
                 <p>{data.billingAddress?.city}, {data.billingAddress?.state} {data.billingAddress?.postalCode}</p>
                 <p>{data.billingAddress?.country}</p>
              </div>
           </div>

           {/* FAQ / Help */}
           <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 text-indigo-900 dark:text-indigo-200">
               <h4 className="font-bold mb-2">Need help with billing?</h4>
               <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-4 leading-relaxed">Check our help center for common questions about invoices and subscriptions.</p>
               <button className="text-sm font-bold underline hover:text-indigo-600">Go to Help Center</button>
           </div>
        </div>
      </div>
    </div>
  );
}
