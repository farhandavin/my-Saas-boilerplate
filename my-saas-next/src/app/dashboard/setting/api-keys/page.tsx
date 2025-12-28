'use client';

import { useState } from 'react';

// Mock Data (Nanti ganti dengan fetch dari API)
const MOCK_KEYS = [
  { id: '1', name: 'Zapier Integration', prefix: 'sk_live_a1b2...', lastUsed: '2 hours ago' }
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    // Simulasi create key
    const secret = "sk_live_" + Math.random().toString(36).substring(2);
    setNewKey(secret);
    setKeys([...keys, { id: Date.now().toString(), name: 'New Key', prefix: secret.substring(0, 10) + '...', lastUsed: 'Never' }]);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔑 API Access</h1>
          <p className="text-gray-500 text-sm">Kelola kunci API untuk integrasi eksternal.</p>
        </div>
        <button 
          onClick={handleCreateKey}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          + Create Secret Key
        </button>
      </div>

      {newKey && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm font-bold mb-2">Simpan kunci ini sekarang! Anda tidak akan bisa melihatnya lagi.</p>
          <div className="flex gap-2">
            <code className="bg-white px-3 py-2 rounded border border-yellow-200 flex-1 font-mono text-sm">{newKey}</code>
            <button 
              onClick={() => {navigator.clipboard.writeText(newKey); alert('Copied!');}}
              className="text-yellow-700 font-bold text-sm hover:underline"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-900">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Token Key</th>
              <th className="px-6 py-4">Last Used</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {keys.map((key) => (
              <tr key={key.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{key.name}</td>
                <td className="px-6 py-4 font-mono text-xs">{key.prefix}</td>
                <td className="px-6 py-4">{key.lastUsed}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-600 hover:text-red-800 font-medium">Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}