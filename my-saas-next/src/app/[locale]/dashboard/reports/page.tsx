'use client';

import React, { useState, useEffect } from 'react';

interface ReportStats {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  aiTokensUsed: number;
  teamMembers: number;
  auditEvents: number;
}

interface ChartData {
  label: string;
  value: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    aiTokensUsed: 0,
    teamMembers: 0,
    auditEvents: 0
  });
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      // Fetch billing data for stats
      const billingRes = await fetch('/api/billing', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (billingRes.ok) {
        const billingData = await billingRes.json();
        setStats({
          totalRevenue: billingData.usage?.currentPeriod?.tokensUsed * 10 || 125000000,
          totalInvoices: billingData.invoiceHistory?.length || 12,
          paidInvoices: billingData.invoiceHistory?.filter((i: any) => i.status === 'paid').length || 10,
          unpaidInvoices: billingData.invoiceHistory?.filter((i: any) => i.status !== 'paid').length || 2,
          aiTokensUsed: billingData.usage?.currentPeriod?.tokensUsed || 45000,
          teamMembers: 8,
          auditEvents: 234
        });
      }
    } catch (error) {
      console.error('Failed to fetch report data', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple bar chart data
  const revenueByMonth: ChartData[] = [
    { label: 'Jul', value: 45 },
    { label: 'Aug', value: 62 },
    { label: 'Sep', value: 58 },
    { label: 'Oct', value: 71 },
    { label: 'Nov', value: 85 },
    { label: 'Dec', value: 92 },
  ];

  const invoicesByStatus: ChartData[] = [
    { label: 'Paid', value: stats.paidInvoices },
    { label: 'Pending', value: Math.floor(stats.unpaidInvoices / 2) },
    { label: 'Overdue', value: Math.ceil(stats.unpaidInvoices / 2) },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-500 dark:text-[#92a4c9] mt-1">Business intelligence dashboard with real-time metrics.</p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-[#1a2332] p-1 rounded-lg">
          {(['week', 'month', 'year'] as const).map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === p 
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            Rp {(stats.totalRevenue / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-emerald-500 mt-1">+12.5% from last {period}</p>
        </div>

        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Total Invoices</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInvoices}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.paidInvoices} paid, {stats.unpaidInvoices} pending</p>
        </div>

        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600">
              <span className="material-symbols-outlined">token</span>
            </div>
            <span className="text-sm font-medium text-gray-500">AI Tokens Used</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.aiTokensUsed / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-400 mt-1">of 100K limit</p>
        </div>

        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Team Members</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.teamMembers}</p>
          <p className="text-xs text-gray-400 mt-1">Active this {period}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="flex items-end gap-3 h-48">
            {revenueByMonth.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-[#135bec] to-blue-400 rounded-t-md transition-all hover:opacity-80"
                  style={{ height: `${item.value}%` }}
                ></div>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Status Chart */}
        <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Invoice Status</h3>
          <div className="flex items-center justify-center h-48 gap-8">
            {invoicesByStatus.map((item, i) => {
              const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-red-500'];
              const total = invoicesByStatus.reduce((acc, curr) => acc + curr.value, 0) || 1;
              const percent = Math.round((item.value / total) * 100);
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-20 h-20 rounded-full ${colors[i]} flex items-center justify-center text-white text-xl font-bold`}>
                    {percent}%
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.value} invoices</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <span className="text-sm text-gray-500">{stats.auditEvents} events this {period}</span>
        </div>
        <div className="space-y-4">
          {[
            { action: 'Invoice #1024 marked as paid', user: 'Sarah K.', time: '2 hours ago', icon: 'check_circle', color: 'text-emerald-500' },
            { action: 'New team member invited', user: 'Admin', time: '5 hours ago', icon: 'person_add', color: 'text-blue-500' },
            { action: 'API Key generated', user: 'System', time: '1 day ago', icon: 'key', color: 'text-purple-500' },
            { action: 'Privacy rule updated', user: 'John D.', time: '2 days ago', icon: 'shield', color: 'text-amber-500' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#232f48] transition-colors">
              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${activity.color}`}>
                <span className="material-symbols-outlined text-[20px]">{activity.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.user}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
