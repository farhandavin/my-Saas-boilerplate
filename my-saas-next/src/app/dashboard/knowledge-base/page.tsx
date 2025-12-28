'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Doc {
  id: string;
  title: string;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch Docs
  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem('token');
      // Anda perlu buat endpoint GET /api/ai/docs untuk list dokumen
      // Ini mock data sementara agar UI tampil
      setDocs([{ id: '1', title: 'SOP Perusahaan.txt', createdAt: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/ai/upload', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      alert('Upload Berhasil!');
      setFile(null);
      setTitle('');
      fetchDocs();
    } catch (err) {
      alert('Upload Gagal');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 Knowledge Base</h1>
      <p className="text-gray-500 mb-8">Upload dokumen internal agar AI mengerti konteks bisnis Anda.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Card */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-gray-800 mb-4">Upload Dokumen</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <input 
              type="text" placeholder="Judul Dokumen" required
              className="w-full p-2 border rounded-lg text-sm"
              value={title} onChange={e => setTitle(e.target.value)}
            />
            <input 
              type="file" required accept=".txt,.md"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <button 
              disabled={uploading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {uploading ? 'Memproses AI...' : 'Upload & Train'}
            </button>
          </form>
        </div>

        {/* List Card */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Dokumen Aktif</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {docs.map(doc => (
              <li key={doc.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                  <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Ready</span>
              </li>
            ))}
            {docs.length === 0 && <li className="p-8 text-center text-gray-400 text-sm">Belum ada dokumen.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}