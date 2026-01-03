import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo | Enterprise OS',
  description: 'Manage your demo',
};

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Demo</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your demo here.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Create Demo
        </button>
      </div>

      <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500">
        <p>No demo found. Get started by creating one.</p>
      </div>
    </div>
  );
}