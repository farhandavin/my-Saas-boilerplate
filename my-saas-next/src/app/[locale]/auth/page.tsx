'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function AuthPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { showError } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/login', form);
      if (res.data.success) {
        // localStorage.setItem('token', res.data.token); // REMOVED: Using HttpOnly Cookie
        if (res.data.team?.id) {
            localStorage.setItem('currentTeamId', res.data.team.id);
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      showError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="antialiased font-display bg-[#f6f6f8] dark:bg-[#101622] text-slate-900 dark:text-white min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#135bec]/30 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#135bec]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#135bec]/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#232f48] px-10 py-4 bg-[#101622]/80 backdrop-blur-md">
        <div className="flex items-center gap-4 text-white">
          <Link href="/" className="size-8 text-[#135bec]">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor" fillOpacity="0.8"></path>
              <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </Link>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Enterprise OS</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-[480px] bg-[#192233] border border-[#232f48] rounded-xl shadow-2xl overflow-hidden">
          {/* Progress / AI Indicator Line */}
          <div className="h-1 w-full bg-[#232f48] relative overflow-hidden">
            <div className="absolute inset-0 bg-[#135bec]/40"></div>
            <div className="absolute h-full w-1/3 bg-[#135bec] blur-[4px] animate-[pulse_3s_ease-in-out_infinite] translate-x-[-100%]"></div>
          </div>
          <div className="p-8 sm:p-10 flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight mb-2">Welcome back</h1>
              <p className="text-[#92a4c9] text-base font-normal leading-normal">Enter your credentials to access the workspace.</p>
            </div>
            
            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              {/* Email */}
              <label className="flex flex-col w-full">
                <p className="text-white text-sm font-medium leading-normal pb-2">Email Address</p>
                <input 
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-[#324467] bg-[#101622] focus:border-[#135bec] h-12 placeholder:text-[#92a4c9] px-4 text-base font-normal transition-all duration-200" 
                  placeholder="name@company.com" 
                />
              </label>

              {/* Password */}
              <label className="flex flex-col w-full">
                <div className="flex justify-between items-baseline pb-2">
                  <p className="text-white text-sm font-medium leading-normal">Password</p>
                </div>
                <div className="flex w-full flex-1 items-stretch rounded-lg relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-[#324467] bg-[#101622] focus:border-[#135bec] h-12 placeholder:text-[#92a4c9] px-4 pr-12 text-base font-normal transition-all duration-200" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 px-4 text-[#92a4c9] hover:text-white transition-colors flex items-center justify-center focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-[#135bec] rounded border-[#324467] bg-[#101622] focus:ring-[#135bec] focus:ring-offset-[#101622]" />
                  <span className="ml-2 text-sm text-[#92a4c9]">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-[#135bec] hover:text-[#1d65f0] hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#135bec] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#1d65f0] transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#135bec]/20 mt-2 disabled:opacity-50"
              >
                {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing In...
                    </span>
                  ) : 'Sign In'}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#232f48]"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-[#92a4c9] uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-[#232f48]"></div>
              </div>

              <button 
                type="button" 
                onClick={() => window.location.href = '/api/auth/google'}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#101622] border border-[#324467] text-white text-base font-medium leading-normal hover:bg-[#232f48]/50 hover:border-[#92a4c9]/50 transition-all duration-200 active:scale-[0.98] group"
              >
                <span className="material-symbols-outlined mr-2 text-[#92a4c9] group-hover:text-white transition-colors text-[20px]">domain</span>
                <span className="truncate">Single Sign-On (SSO)</span>
              </button>
            </form>
          </div>
          
          <div className="bg-[#101622]/50 border-t border-[#232f48] p-4 text-center">
            <p className="text-xs text-[#92a4c9]">
              Don&apos;t have an account? <Link href="/register" className="text-white hover:text-[#135bec] transition-colors font-medium">Register</Link>
            </p>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#92a4c9] text-[16px]">lock</span>
            <span className="text-xs text-[#92a4c9] font-medium uppercase tracking-wider">Secure Enterprise Connection</span>
          </div>
          <p className="text-xs text-[#92a4c9]/60">
            © 2024 Enterprise OS. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
