'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { getErrorMessage } from '@/lib/error-utils';


interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  
  const { showSuccess, showError } = useToast();

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/api-keys');
      const data = await response.json();
      
      if (data.success) {
        setKeys(data.apiKeys);
      } else {
        throw new Error(data.error || 'Failed to fetch API keys');
      }
    } catch (error: unknown) {
      console.error('Error fetching API keys:', error);
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: keyName })
      });

      const data = await response.json();

      if (data.success) {
        setNewKey(data.apiKey.key);
        showSuccess('API Key created successfully');
        setShowCreateModal(false);
        setKeyName('');
        fetchKeys();
      } else {
        throw new Error(data.error || 'Failed to create API key');
      }
    } catch (error: unknown) {
      console.error('Error creating API key:', error);
      showError(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
         showSuccess('API Key revoked');
         fetchKeys();
      } else {
         const data = await response.json().catch(() => ({}));
         if (data.error) throw new Error(data.error);
      }
    } catch (error: unknown) {
      console.error('Error revoking API key:', error);
      showError('Failed to revoke key');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🔑 API Access</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage API keys for external integration.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Create Secret Key
        </button>
      </div>

      {newKey && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
          <p className="text-yellow-800 dark:text-yellow-500 text-sm font-bold mb-2">Save this key now! You won&apos;t be able to see it again.</p>
          <div className="flex gap-2">
            <code className="bg-white dark:bg-black/20 px-3 py-2 rounded border border-yellow-200 dark:border-yellow-900/30 flex-1 font-mono text-sm dark:text-yellow-200" data-testid="api-key-value">{newKey}</code>
            <button 
              onClick={() => {navigator.clipboard.writeText(newKey); showSuccess('Copied to clipboard!');}}
              className="text-yellow-700 dark:text-yellow-500 font-bold text-sm hover:underline"
              data-testid="copy-key"
            >
              Copy
            </button>
            <button 
              onClick={() => setNewKey(null)}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300" data-testid="api-keys-list">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 font-medium text-gray-900 dark:text-white">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Token Key</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Last Used</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {loading ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading keys...</td>
               </tr>
            ) : keys.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No API keys found. Create one to get started.</td>
               </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors api-key-item">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{key.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{key.prefix}</td>
                  <td className="px-6 py-4">{new Date(key.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New API Key</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="e.g. Production Server"
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating || !keyName.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                  data-testid="create-key-submit"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}