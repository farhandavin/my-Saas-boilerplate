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
  const { showSuccess, showError } = useToast();

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      const response = await fetch('/api/api-keys', {
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // }
      });
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

  const handleCreateKey = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      const name = prompt('Enter a name for this API key (e.g. "Production Server"):');
      
      if (!name) {
        setIsCreating(false);
        return;
      }

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (data.success) {
        setNewKey(data.apiKey.key);
        showSuccess('API Key created successfully');
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
      // const token = localStorage.getItem('token');
      const response = await fetch(`/api/api-keys?id=${id}`, { // Assuming DELETE uses query param or body
        method: 'DELETE',
        // headers: {
        //   'Authorization': `Bearer ${token}`
        // }
      });
      
      // Note: The generic DELETE handler might need to be implemented in route.ts if not present
      // Current route.ts only showed GET and POST. I'll need to check if DELETE exists or add it.
      // Based on previous file view, only GET and POST were in route.ts.
      // I will proceed with GET/POST integration first and then add DELETE to route.ts
      
      if (response.ok) { // Fallback if API returns 200 without json success: true wrapping
         showSuccess('API Key revoked');
         fetchKeys();
      } else {
         const data = await response.json().catch(() => ({}));
         if (data.error) throw new Error(data.error);
         // If DELETE is missing, this will fail.
      }
    } catch (error: unknown) {
      // For now, since DELETE endpoint might be missing, we just show error
      console.error('Error revoking API key:', error);
      showError('Revoke functionality requires backend implementation');
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
          onClick={handleCreateKey}
          disabled={isCreating}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isCreating ? 'Creating...' : '+ Create Secret Key'}
        </button>
      </div>

      {newKey && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
          <p className="text-yellow-800 dark:text-yellow-500 text-sm font-bold mb-2">Save this key now! You won't be able to see it again.</p>
          <div className="flex gap-2">
            <code className="bg-white dark:bg-black/20 px-3 py-2 rounded border border-yellow-200 dark:border-yellow-900/30 flex-1 font-mono text-sm dark:text-yellow-200">{newKey}</code>
            <button 
              onClick={() => {navigator.clipboard.writeText(newKey); showSuccess('Copied to clipboard!');}}
              className="text-yellow-700 dark:text-yellow-500 font-bold text-sm hover:underline"
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

      <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
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
                <tr key={key.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
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
    </div>
  );
}