'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const [ticket, setTicket] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // If URL params exist (e.g., ?plan=enterprise), we could pre-fill the form
  // For now, simple form.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Send to backend
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Contact Sales & Support</h1>
      
      {submitted ? (
         <div className="p-6 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-lg">
           <h3 className="text-lg font-bold mb-2">Message Sent!</h3>
           <p>Our team will get back to you shortly.</p>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Subject</label>
            <select 
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 p-2"
              value={ticket.subject}
              onChange={e => setTicket({...ticket, subject: e.target.value})}
            >
              <option value="">Select a Topic</option>
              <option value="enterprise">Enterprise Plan Inquiry</option>
              <option value="billing">Billing Issue</option>
              <option value="support">Technical Support</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-medium mb-1 dark:text-slate-300">Message</label>
             <textarea 
               className="w-full rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-700 p-2 min-h-[150px]"
               placeholder="How can we help you?"
               value={ticket.message}
               onChange={e => setTicket({...ticket, message: e.target.value})}
               required
             />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors">
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
