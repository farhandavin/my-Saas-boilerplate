'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { WEBHOOK_EVENTS, WebhookEvent } from '@/types';

// Types locally until we have global types updated everywhere
interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret: string;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  eventId: string;
  eventType: string;
  status: 'success' | 'failed';
  responseCode: number;
  createdAt: string;
}

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });
  
  // Specific webhook details
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      if (data.success) {
        setWebhooks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhook.url || newWebhook.events.length === 0) {
      showError('Please enter URL and select at least one event');
      return;
    }

    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook)
      });
      
      const data = await res.json();
      if (res.ok) {
        showSuccess('Webhook created successfully');
        setIsCreating(false);
        setNewWebhook({ url: '', events: [] });
        fetchWebhooks();
      } else {
        showError(data.error || 'Failed to create webhook');
      }
    } catch (error) {
      showError('Failed to create webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Webhook deleted');
        fetchWebhooks();
        if (selectedWebhook?.id === id) {
          setSelectedWebhook(null);
        }
      }
    } catch (error) {
      showError('Failed to delete webhook');
    }
  };

  const fetchDeliveries = async (webhookId: string) => {
    setLoadingDeliveries(true);
    try {
      const res = await fetch(`/api/webhooks/${webhookId}/deliveries`);
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDeliveries(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h2>
          <p className="text-gray-500">Manage external connections and webhooks</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {isCreating ? 'Cancel' : 'Add Webhook'}
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Webhook</h3>
          <form onSubmit={handleCreateWebhook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payload URL</label>
              <input
                type="url"
                required
                placeholder="https://api.yourapp.com/webhooks"
                value={newWebhook.url}
                onChange={e => setNewWebhook({...newWebhook, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Events to Subscribe</label>
              <div className="grid grid-cols-2 gap-3">
                {WEBHOOK_EVENTS.map(evt => (
                  <label key={evt.value} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(evt.value)}
                      onChange={() => toggleEvent(evt.value)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm dark:text-gray-300">{evt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create Webhook
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Webhooks List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Active Webhooks</h3>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
              <p className="text-gray-500">No webhooks configured</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map(webhook => (
                <div 
                  key={webhook.id}
                  onClick={() => {
                    setSelectedWebhook(webhook);
                    fetchDeliveries(webhook.id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedWebhook?.id === webhook.id 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-indigo-600 truncate max-w-md">
                          {webhook.url}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          webhook.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {webhook.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {webhook.events.map(evt => (
                          <span key={evt} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs dark:text-gray-300">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWebhook(webhook.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details & Logs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Deliveries</h3>
          {selectedWebhook ? (
            <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <div className="text-xs font-mono text-gray-500 mb-1">Secret Key</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 flex-1 truncate">
                    {selectedWebhook.secret}
                  </span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(selectedWebhook.secret)}
                    className="text-gray-500 hover:text-indigo-600"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto p-2">
                {loadingDeliveries ? (
                  <div className="text-center py-4 text-sm text-gray-500">Loading history...</div>
                ) : deliveries.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">No deliveries yet</div>
                ) : (
                  <div className="space-y-2">
                    {deliveries.map(delivery => (
                      <div key={delivery.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm">
                        <div className="flex justify-between mb-1">
                          <span className={`font-medium ${
                            delivery.status === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {delivery.status.toUpperCase()} {delivery.responseCode}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(delivery.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 break-all">
                          {delivery.eventId}
                        </div>
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[10px] text-gray-600 dark:text-gray-300">
                          {delivery.eventType}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500">Select a webhook to view details and recent delivery logs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
