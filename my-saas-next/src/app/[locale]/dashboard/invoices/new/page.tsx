
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiChecking, setAiChecking] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    description: '',
    amount: '',
    dueDate: '',
  });

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleAiPreCheck = async () => {
    if (!formData.description) return;
    setAiChecking(true);
    try {
        // Simulate AI check (since actual pre-check endpoint expects a document, we might need a text-based endpoint or just mock for MVP)
        // For MVP, let's call the pre-check endpoint if we had a document, but here we just have text.
        // We'll mock it for now or implement a text-based pre-check later.
        // Let's assume we send description as a "document snippet" or just a timeout mock.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (formData.amount && Number(formData.amount) > 10000) {
            setAiSuggestion('High value invoice detected. Ensure tax compliance details are included in description.');
        } else {
            setAiSuggestion('Invoice details look good. Ready to send.');
        }
    } finally {
        setAiChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          description: formData.description,
          amount: Math.round(parseFloat(formData.amount) * 100), // convert to cents
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/invoices');
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Invoice</h1>
        <p className="text-slate-500 dark:text-slate-400">Fill in the details below</p>
      </div>

      <div className="bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description / Items</label>
                <button 
                  type="button" 
                  onClick={handleAiPreCheck}
                  disabled={aiChecking || !formData.description}
                  className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[14px]">{aiChecking ? 'sync' : 'auto_awesome'}</span>
                    {aiChecking ? 'Checking...' : 'AI Check'}
                </button>
             </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Describe services or products..."
            />
             {aiSuggestion && (
                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-[18px] shrink-0">auto_awesome</span>
                    {aiSuggestion}
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
