// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import './AuthFlip.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const [error, setError] = useState(''); // State untuk pesan error
  const navigate = useNavigate();

  // Reset error saat pindah mode (Login <-> Register)
  const toggleMode = (mode) => {
    setIsSignUp(mode);
    setError('');
  };

  // --- LOGIKA LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error lama
    setIsLoading(true);

    const email = e.target.logemail.value;
    const password = e.target.logpass.value;

    // 1. Validasi Input User
    if (!email || !password) {
      setError("Harap isi email dan password!");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Panggil API Backend
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika server merespon error (misal: password salah)
        throw new Error(data.message || 'Gagal login. Periksa kredensial Anda.');
      }

      // 3. Sukses
      console.log("✅ Login Berhasil:", data);
      localStorage.setItem('token', data.token); // Simpan token
      localStorage.setItem('user', JSON.stringify(data.user)); // Simpan data user (opsional)
      navigate('/dashboard');

    } catch (err) {
      // 4. Tangkap Error (Untuk Debug & User)
      console.error("❌ Error Login:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIKA REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const name = e.target.regname.value;
    const email = e.target.regemail.value;
    const password = e.target.regpass.value;

    // 1. Validasi Input
    if (!name || !email || !password) {
      setError("Semua kolom wajib diisi!");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Panggil API Backend
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mendaftar. Coba lagi.');
      }

      // 3. Sukses
      console.log("✅ Register Berhasil:", data);
      alert("Registrasi berhasil! Silakan login.");
      setIsSignUp(false); // Pindah ke tab Login otomatis

    } catch (err) {
      // 4. Tangkap Error
      console.error("❌ Error Register:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-[440px] text-center">
        
        {/* Toggle Switch */}
        <div className="mb-8">
          <h6 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2">
            <span 
              onClick={() => toggleMode(false)} 
              className={`cursor-pointer mr-4 transition-colors ${!isSignUp ? 'text-blue-600' : 'hover:text-slate-600'}`}
            >
              Log In
            </span>
            <span 
              onClick={() => toggleMode(true)} 
              className={`cursor-pointer ml-4 transition-colors ${isSignUp ? 'text-blue-600' : 'hover:text-slate-600'}`}
            >
              Sign Up
            </span>
          </h6>
          
          <div className="relative inline-block w-14 h-8 rounded-full bg-slate-200 cursor-pointer" onClick={() => toggleMode(!isSignUp)}>
             <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-blue-600 shadow-md transform transition-transform duration-300 ${isSignUp ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>

        {/* ERROR ALERT BOX (Muncul jika ada error) */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2 justify-center animate-pulse">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 3D Flip Container */}
        <div className="card-3d-wrap mx-auto">
          <div className={`card-3d-wrapper ${isSignUp ? 'flipped' : ''}`}>
            
            {/* Front Side: LOGIN */}
            <div className="card-front">
              <div className="center-wrap">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back!</h4>
                  <form onSubmit={handleLogin}>
                    <div className="relative mb-3">
                      <input type="email" name="logemail" className="form-style" placeholder="Your Email" autoComplete="off" disabled={isLoading} />
                      <Mail className="input-icon w-5 h-5" />
                    </div>
                    <div className="relative mb-4">
                      <input type="password" name="logpass" className="form-style" placeholder="Your Password" autoComplete="off" disabled={isLoading} />
                      <Lock className="input-icon w-5 h-5" />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Log In <ArrowRight size={18} /></>}
                    </button>
                  </form>
                  <p className="mt-4 text-sm text-slate-500">
                    <a href="/forgot-password" class="hover:text-blue-600 transition-colors">Forgot your password?</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Back Side: REGISTER */}
            <div className="card-back">
              <div className="center-wrap">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-slate-800 mb-6">Create Account</h4>
                  <form onSubmit={handleRegister}>
                    <div className="relative mb-3">
                      <input type="text" name="regname" className="form-style" placeholder="Full Name" autoComplete="off" disabled={isLoading} />
                      <User className="input-icon w-5 h-5" />
                    </div>
                    <div className="relative mb-3">
                      <input type="email" name="regemail" className="form-style" placeholder="Email Address" autoComplete="off" disabled={isLoading} />
                      <Mail className="input-icon w-5 h-5" />
                    </div>
                    <div className="relative mb-4">
                      <input type="password" name="regpass" className="form-style" placeholder="Password" autoComplete="off" disabled={isLoading} />
                      <Lock className="input-icon w-5 h-5" />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign Up Now"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AuthPage;