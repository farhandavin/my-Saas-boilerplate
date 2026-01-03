import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCampaignPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link 
        href="/dashboard/campaigns"
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Campaign</h1>
        <p className="text-slate-500">Define your campaign goals and budget.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <CampaignForm />
      </div>
    </div>
  );
}
