
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Invoice = {
  id: string;
  amount: number;
  status: string;
  customerName: string;
  dueDate: string;
  createdAt: string;
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  async function fetchInvoices() {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== id));
      } else {
        alert('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice');
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage your team's invoices</p>
        </div>
        <Link 
          href="/dashboard/invoices/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Invoice
        </Link>
      </div>

      <div className="bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs uppercase text-slate-500 font-semibold">
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-8 text-center text-slate-500">
                     No invoices found. Create your first one!
                   </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {invoice.customerName || 'Unknown Customer'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      ${(invoice.amount / 100).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right relative">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === invoice.id ? null : invoice.id);
                        }}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                       >
                         <span className="material-symbols-outlined text-[20px]">more_vert</span>
                       </button>

                       {/* Dropdown Menu */}
                       {activeMenu === invoice.id && (
                         <div className="absolute right-4 top-10 w-36 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-10 flex flex-col py-1 text-left">

                           <button 
                             onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                             className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 w-full text-left"
                           >
                             Details
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); deleteInvoice(invoice.id); }}
                             className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                           >
                             Delete
                           </button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
