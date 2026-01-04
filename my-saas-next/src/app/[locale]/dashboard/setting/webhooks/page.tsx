'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: string;
}

const AVAILABLE_EVENTS = [
  'invoice.created',
  'invoice.paid',
  'invoice.overdue',
  'team.member.added',
  'team.member.removed',
  'document.uploaded',
  'api_key.created',
  'api_key.revoked',
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });
  const { showSuccess, showError } = useToast();

  const fetchWebhooks = useCallback(async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/webhooks', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleCreate = async () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      showError('Please provide URL and select at least one event');
      return;
    }

    try {
      // const token = localStorage.getItem('token');
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWebhook)
      });

      if (res.ok) {
        showSuccess('Webhook created successfully!');
        setShowModal(false);
        setNewWebhook({ url: '', events: [] });
        fetchWebhooks();
      } else {
        const data = await res.json();
        showError(data.error || 'Failed to create webhook');
      }
    } catch (error) {
      showError('Failed to create webhook');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      // const token = localStorage.getItem('token');
      await fetch(`/api/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchWebhooks();
    } catch (error) {
      showError('Failed to toggle webhook');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      // const token = localStorage.getItem('token');
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
        // headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showSuccess('Webhook deleted');
        fetchWebhooks();
      }
    } catch (error) {
      showError('Failed to delete webhook');
    }
  };

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        {[1,2].map(i => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Webhooks</h1>
          <p className="text-gray-500 dark:text-[#92a4c9] mt-1">Receive real-time notifications when events happen in your workspace.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#135bec] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0b46b9] transition-colors shadow-lg shadow-blue-500/30"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Webhook
        </button>
      </div>

      {/* Webhook List */}
      <div className="space-y-4" data-testid="webhooks-list">
        {webhooks.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-[#1a2332]/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <p>No webhooks configured</p>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <span className="material-symbols-outlined text-3xl">webhook</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No webhooks configured</h3>
            <p className="text-gray-500 mt-1">Create your first webhook to start receiving events.</p>
          </div>
        ) : (
          webhooks.map(webhook => (
            <div 
              key={webhook.id}
              className="bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-gray-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                    <p className="font-mono text-sm text-gray-900 dark:text-white truncate">{webhook.url}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(webhook.events as string[]).map(event => (
                      <span 
                        key={event}
                        className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Created: {new Date(webhook.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggle(webhook.id, webhook.isActive)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      webhook.isActive 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {webhook.isActive ? 'Active' : 'Disabled'}
                  </button>
                  <button 
                    onClick={() => handleDelete(webhook.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Webhook</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Endpoint URL</label>
                <input 
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-server.com/webhook"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151b26] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Events to Subscribe</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <button
                      key={event}
                      onClick={() => toggleEvent(event)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors text-left ${
                        newWebhook.events.includes(event)
                          ? 'bg-[#135bec]/10 border-[#135bec] text-[#135bec]'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="px-4 py-2 bg-[#135bec] text-white rounded-lg font-medium hover:bg-[#0b46b9] transition-colors"
                type="submit"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
