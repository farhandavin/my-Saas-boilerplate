'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  customerName: string;
  customerEmail?: string;
  dueDate: string;
  createdAt: string;
  items?: { description: string; quantity: number; unitPrice: number }[];
  description?: string;
  invoiceNumber?: string;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string);
    }
  }, [params.id]);

  const fetchInvoice = async (id: string) => {
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch(`/api/invoices/${id}`, {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
      } else {
        alert('Failed to load invoice'); // Should use toast in real app
        router.push('/dashboard/invoices');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#101922] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#137fec] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoice Details</h1>
            <p className="text-slate-500 dark:text-slate-400">View and manage invoice #{invoice.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Download PDF
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
            Send to Customer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-8">
        {/* Status & Meta */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide
              ${invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
              {invoice.status}
            </span>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Invoice ID</p>
            <p className="font-mono text-slate-900 dark:text-white">{invoice.id}</p>
          </div>
          <div className="text-right">
             <p className="text-sm text-slate-500 dark:text-slate-400">Amount Due</p>
             <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">${(invoice.amount / 100).toFixed(2)}</p>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
               Due on {new Date(invoice.dueDate).toLocaleDateString()}
             </p>
          </div>
        </div>

        {/* Customer & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
           <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Bill To</h3>
             <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{invoice.customerName}</p>
             <p className="text-slate-500 dark:text-slate-400">{invoice.customerEmail || 'No email provided'}</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Issued Date</h3>
               <p className="text-slate-700 dark:text-slate-300">{new Date(invoice.createdAt).toLocaleDateString()}</p>
             </div>
             <div>
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Due Date</h3>
               <p className="text-slate-700 dark:text-slate-300">{new Date(invoice.dueDate).toLocaleDateString()}</p>
             </div>
           </div>
        </div>

        {/* Line Items (Mocked if empty, assuming API might not return them yet fully populated) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Description</h3>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
             <div className="flex justify-between items-center mb-2">
               <span className="font-medium text-slate-900 dark:text-white">
                 {invoice.description || 'Professional Services'}
               </span>
               <span className="font-medium text-slate-900 dark:text-white">
                 ${(invoice.amount / 100).toFixed(2)}
               </span>
             </div>
             {/* Add more items here if available */}
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="w-64">
               <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-2">
                 <span>Subtotal</span>
                 <span>${(invoice.amount / 100).toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-2">
                 <span>Tax (0%)</span>
                 <span>$0.00</span>
               </div>
               <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                 <span>Total</span>
                 <span>${(invoice.amount / 100).toFixed(2)}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
