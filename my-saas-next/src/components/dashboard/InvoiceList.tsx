import { Download, FileText, CheckCircle } from 'lucide-react';

const invoices = [
  { id: 'inv_001', date: '2024-12-01', amount: 500000, status: 'PAID' },
  { id: 'inv_002', date: '2024-11-01', amount: 450000, status: 'PAID' },
  { id: 'inv_003', date: '2024-10-01', amount: 450000, status: 'PAID' },
];

export const InvoiceList = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
            <th className="px-6 py-3">Invoice ID</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Download</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-mono text-slate-600 flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                {inv.id}
              </td>
              <td className="px-6 py-4 text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 font-medium text-slate-900">
                Rp {inv.amount.toLocaleString('id-ID')}
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full w-fit">
                  <CheckCircle size={12} /> {inv.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Download size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
