'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSent(true);
    } catch (err: any) {
      showError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f6f6f8] dark:bg-[#101622] font-display text-slate-900 dark:text-white antialiased min-h-screen flex flex-col overflow-hidden selection:bg-[#135bec]/30">
      {/* Background Abstract Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Right Glow */}
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#135bec]/20 blur-[120px] opacity-60 mix-blend-screen"></div>
        {/* Bottom Left Glow */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[100px] opacity-40 mix-blend-screen"></div>
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Navigation */}
      <header className="relative z-10 w-full px-6 py-4 lg:px-10 flex items-center justify-between border-b border-slate-200 dark:border-[#232f48]/50 bg-white/50 dark:bg-[#111722]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center justify-center size-10 rounded-lg bg-[#135bec]/10 text-[#135bec]">
            {/* Logo Icon */}
            <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
              <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </Link>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Enterprise OS</h2>
        </div>
        <div className="flex items-center">
          <Link href="#" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#135bec] dark:hover:text-[#135bec] transition-colors">Need help?</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-[520px] mx-auto">
          {/* Card Container */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#161e2c] border border-slate-200 dark:border-[#232f48] shadow-2xl shadow-black/40">
            {/* Card Header Visual */}
            <div className="h-2 w-full bg-gradient-to-r from-[#135bec] via-blue-400 to-[#135bec]"></div>
            
            {!sent ? (
              <div className="p-8 md:p-10 flex flex-col gap-6">
                {/* Header Text Section */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center size-14 rounded-full bg-[#135bec]/10 dark:bg-[#135bec]/20 mb-6 text-[#135bec]">
                    <span className="material-symbols-outlined text-3xl">lock_reset</span>
                  </div>
                  <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight mb-3">Reset your password</h1>
                  <p className="text-slate-500 dark:text-[#92a4c9] text-base font-normal leading-relaxed max-w-[400px] mx-auto">
                    Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                  </p>
                </div>
                
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
                  {/* Email Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-white text-sm font-medium leading-normal ml-1" htmlFor="email">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-[#92a4c9]">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </div>
                      <input 
                        className="form-input block w-full rounded-xl border-slate-300 dark:border-[#324467] bg-slate-50 dark:bg-[#192233] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] focus:border-[#135bec] focus:ring-[#135bec] focus:ring-1 py-3.5 pl-11 pr-4 text-base transition-colors" 
                        id="email" 
                        name="email" 
                        placeholder="name@company.com" 
                        required 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#135bec] hover:bg-blue-600 transition-all duration-200 h-12 px-5 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 disabled:opacity-50"
                  >
                    <span className="relative z-10 text-base font-bold leading-normal tracking-[0.015em] flex items-center gap-2">
                      {loading ? 'Sending...' : 'Send Instructions'}
                      {!loading && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                    </span>
                  </button>
                </form>
                
                {/* Footer Link */}
                <div className="mt-2 text-center">
                  <Link href="/auth" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-[#92a4c9] hover:text-slate-800 dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Return to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              // Success State
              <div className="p-8 md:p-10 flex flex-col gap-6 text-center">
                 <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4 mx-auto text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">Check your email</h2>
                  <p className="text-slate-500 dark:text-[#92a4c9] text-base font-normal leading-relaxed max-w-[400px] mx-auto">
                    We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                  </p>
                  <div className="mt-4">
                    <Link href="/auth" className="inline-flex w-full items-center justify-center rounded-xl bg-[#135bec] hover:bg-blue-600 transition-all duration-200 h-12 px-5 text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 font-bold">
                      Return to Sign In
                    </Link>
                  </div>
              </div>
            )}

            {/* Bottom Security Badge */}
            <div className="bg-slate-50 dark:bg-[#111722]/50 py-3 px-8 border-t border-slate-100 dark:border-[#232f48] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 text-[16px]">verified_user</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Secure Enterprise Encryption</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          © 2024 Enterprise Business OS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
