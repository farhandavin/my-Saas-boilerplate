// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Tambah useLocation
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import './AuthFlip.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  useEffect(() => {
    // Parse query params dari URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      
      // Opsional: Fetch user data segera untuk disimpan di localStorage 'user'
      // Atau biarkan Dashboard yang mengambilnya nanti
      
      // Bersihkan URL agar token tidak terlihat terus
      window.history.replaceState({}, document.title, "/dashboard");
      navigate('/dashboard');
    }
  },[location, navigate]);

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
      const response = await fetch(`${api_url}/api/auth/login`, {
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
      const response = await fetch(`${api_url}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mendaftar. Coba lagi.');
      }

      // 3. Sukses
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

  const handleGoogleLogin = () => {
    // Redirect user ke endpoint backend untuk memulai proses OAuth
    window.location.href = `${api_url}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-10 px-4 transition-colors duration-300">
      <div className="w-full max-w-[440px] text-center">
        
        {/* Toggle Switch */}
        <div className="mb-8">
           {/* ... kode toggle switch lama ... */}
           <h6 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2">
            <span onClick={() => toggleMode(false)} className={`cursor-pointer mr-4 transition-colors ${!isSignUp ? 'text-blue-600' : 'hover:text-slate-600'}`}>Log In</span>
            <span onClick={() => toggleMode(true)} className={`cursor-pointer ml-4 transition-colors ${isSignUp ? 'text-blue-600' : 'hover:text-slate-600'}`}>Sign Up</span>
          </h6>
          <div className="relative inline-block w-14 h-8 rounded-full bg-slate-200 cursor-pointer" onClick={() => toggleMode(!isSignUp)}>
             <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-blue-600 shadow-md transform transition-transform duration-300 ${isSignUp ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2 justify-center animate-pulse">
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}

        {/* 3D Flip Container */}
        <div className="card-3d-wrap mx-auto">
          <div className={`card-3d-wrapper ${isSignUp ? 'flipped' : ''}`}>
            
            {/* --- FRONT: LOGIN --- */}
            <div className="card-front">
              <div className="center-wrap">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back!</h4>
                  
                  {/* Form Login */}
                  <form onSubmit={handleLogin}>
                    {/* ... input email & password lama ... */}
                    <div className="relative mb-3">
                      <input type="email" name="logemail" className="form-style" placeholder="Your Email" autoComplete="off" disabled={isLoading} />
                      <Mail className="input-icon w-5 h-5" />
                    </div>
                    <div className="relative mb-4">
                      <input type="password" name="logpass" className="form-style" placeholder="Your Password" autoComplete="off" disabled={isLoading} />
                      <Lock className="input-icon w-5 h-5" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all mb-4">
                      {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Log In"}
                    </button>
                  </form>

                  {/* DIVIDER */}
                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  </div>

                  {/* GOOGLE BUTTON */}
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                  </button>

                  <p className="mt-4 text-sm text-slate-500">
                    <a href="/forgot-password" class="hover:text-blue-600 transition-colors">Forgot your password?</a>
                  </p>
                </div>
              </div>
            </div>

            {/* --- BACK: REGISTER --- */}
            <div className="card-back">
              <div className="center-wrap">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-slate-800 mb-6">Create Account</h4>
                  <form onSubmit={handleRegister}>
                     {/* ... input name, email, password lama ... */}
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
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all mb-4">
                      {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Sign Up Now"}
                    </button>
                  </form>

                  {/* DIVIDER & GOOGLE BUTTON DI REGISTER JUGA (OPSIONAL) */}
                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </button>

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