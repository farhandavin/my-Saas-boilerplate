'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', form);
      if (res.data.success) {
        // Simpan token untuk akses API Client-side
        localStorage.setItem('token', res.data.token);
        router.push('/dashboard');
      }
    } catch (err) {
      alert("Login Gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login BusinessOS</h1>
        <input 
          className="w-full mb-4 p-2 border rounded" 
          placeholder="Email" 
          onChange={e => setForm({...form, email: e.target.value})}
        />
        <input 
          className="w-full mb-6 p-2 border rounded" 
          type="password" 
          placeholder="Password"
          onChange={e => setForm({...form, password: e.target.value})}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Masuk</button>
      </form>
    </div>
  );
}