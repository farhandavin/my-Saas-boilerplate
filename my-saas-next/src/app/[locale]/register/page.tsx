'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Role } from '@/types';

type RegistrationMode = 'owner' | 'join';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('token');
  const { showError, showSuccess } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Default mode is owner unless token exists
  const [mode, setMode] = useState<RegistrationMode>(inviteToken ? 'join' : 'owner');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    inviteCode: inviteToken || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'owner' 
        ? '/api/auth/register' 
        : '/api/auth/register-invite';
      
      const payload = mode === 'owner' 
        ? { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password, 
            companyName: formData.companyName,
            role: 'ADMIN' as Role
          }
        : {
            name: formData.name,
            email: formData.email, 
            password: formData.password,
            inviteCode: formData.inviteCode
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      showSuccess('Registration successful!');
      router.push('/auth?registered=true');
    } catch (err: any) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f6f6f8] dark:bg-[#101622] text-slate-900 dark:text-white font-sans overflow-x-hidden">
      {/* Left Column: Registration Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32 relative z-10 bg-[#f6f6f8] dark:bg-[#101622]">
        {/* Logo / Header */}
        <div className="mb-10 flex items-center gap-3">
          <div className="size-10 flex items-center justify-center rounded-xl bg-[#135bec] text-white">
            <span className="material-symbols-outlined text-[24px]">grid_view</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Enterprise OS</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white lg:text-4xl">
            {inviteToken ? 'Join your Team' : 'Initialize your OS'}
          </h2>
          <p className="mt-3 text-base font-normal text-slate-500 dark:text-[#92a4c9]">
            {inviteToken 
              ? 'Enter your details to accept the invitation.' 
              : 'Join the infrastructure built for the future of B2B.'}
          </p>
        </div>

        {/* Social Auth (Visual only for now, can be hooked up later) */}
        {!inviteToken && (
            <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                <button type="button" className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 dark:border-[#324467] bg-white dark:bg-[#192233] h-12 px-4 hover:bg-slate-50 dark:hover:bg-[#232f48] transition-colors">
                    <img 
                        alt="Google" 
                        className="h-5 w-5" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZqQK2T0MuKRgM4LIePdtl4_0gFgH172ivQ2UDi3dK726cAVLUinnRv4ffsAIVxAhWoDv2JFuPiDx_FLu18ZgN1Jhs0oWhYc9SqOh_T4j5McdDiMyP-jZQtx805_drIDERK5ka7WFbg9VGDE5aJ4Gx5MDwNzvF5Qw9at0mvRDiqYuXdWmXMAh6_l83LXU2EcdG5BEvfivDwhpYQY1L9c1PobuEjmikRxgjqfW1Do07HuWppkhGDKb-uDop0r9l7UMMXkGIi2DGTOY"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-white">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 dark:border-[#324467] bg-white dark:bg-[#192233] h-12 px-4 hover:bg-slate-50 dark:hover:bg-[#232f48] transition-colors">
                    <img 
                        alt="Microsoft" 
                        className="h-5 w-5" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMfL3cNOtLmqMfzcALp9r5yw7nmcd3ZoSbXRgBwLXuMbKCPz_pExb92xtIf-cv74sFwnTWwMBjrH1k7ldGzScnwrqPeSjOxBGDpsc2fEykZavq8Yb3UlH2gpGrq-lT4_0Fs4s7VwSBtkJqA1-u7KHd2PvLu7zHtcdxWDTXxJbqot4XkjQqkd1L3p5WVgdNDka3FBnzZNVVAaHvwQfqmm6aZj8iRA_HpqYaUSLznYrIzvpuSPSF7z2XEYmT-KdKSoNRKTHCIQzqqnM"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-white">Microsoft</span>
                </button>
                </div>

                <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-[#324467]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-[#f6f6f8] dark:bg-[#101622] px-2 text-slate-500 dark:text-[#92a4c9]">Or continue with email</span>
                </div>
                </div>
            </>
        )}

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Join Mode: Invite Code (Hidden if Owner, Pre-filled if Token exists) */}
          {mode === 'join' && !inviteToken && (
               <div>
               <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Invite Code</label>
               <div className="relative">
                 <input 
                   name="inviteCode"
                   value={formData.inviteCode}
                   onChange={handleChange}
                   required
                   className="block w-full rounded-lg border border-slate-200 dark:border-[#324467] bg-white dark:bg-[#192233] p-3 pl-11 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] sm:text-sm h-12 uppercase tracking-wider font-mono" 
                   placeholder="INV-XXXXX-XXXXX" 
                   type="text"
                 />
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-[#92a4c9]">
                   <span className="material-symbols-outlined text-[20px]">key</span>
                 </div>
               </div>
             </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Full Name</label>
            <div className="relative">
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-slate-200 dark:border-[#324467] bg-white dark:bg-[#192233] p-3 pl-11 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] sm:text-sm h-12" 
                placeholder="Enter your full name" 
                type="text"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-[#92a4c9]">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Work Email</label>
            <div className="relative">
              <input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full rounded-lg border border-slate-200 dark:border-[#324467] bg-white dark:bg-[#192233] p-3 pl-11 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] sm:text-sm h-12" 
                placeholder="name@company.com" 
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-[#92a4c9]">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
            </div>
          </div>

          {/* Company (Owner Only) */}
          {mode === 'owner' && (
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Company Name</label>
                <div className="relative">
                <input 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border border-slate-200 dark:border-[#324467] bg-white dark:bg-[#192233] p-3 pl-11 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] sm:text-sm h-12" 
                    placeholder="Your Organization" 
                    type="text"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-[#92a4c9]">
                    <span className="material-symbols-outlined text-[20px]">domain</span>
                </div>
                </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">Password</label>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="block w-full rounded-lg border border-slate-200 dark:border-[#324467] bg-white dark:bg-[#192233] p-3 pl-11 pr-10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] focus:border-[#135bec] focus:ring-1 focus:ring-[#135bec] sm:text-sm h-12" 
                placeholder="Create a strong password" 
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-[#92a4c9]">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-[#92a4c9] hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {/* Password Strength Meter (Static visual for now as per HTML) */}
            <div className="mt-2 flex gap-1">
              <div className={`h-1 flex-1 rounded-full ${formData.password.length > 0 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-[#324467]'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${formData.password.length > 8 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-[#324467]'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${formData.password.length > 12 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-[#324467]'}`}></div>
              <div className="h-1 flex-1 rounded-full bg-slate-200 dark:bg-[#324467]"></div>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#92a4c9]">Must be at least 8 characters</p>
          </div>

          <div className="flex items-center gap-2">
            <input 
                id="terms" 
                type="checkbox" 
                required
                className="h-4 w-4 rounded border-slate-300 dark:border-[#324467] bg-white dark:bg-[#192233] text-[#135bec] focus:ring-[#135bec]" 
            />
            <label className="text-sm text-slate-500 dark:text-[#92a4c9]" htmlFor="terms">
                I agree to the <a href="#" className="text-[#135bec] hover:underline">Terms of Service</a> and <a href="#" className="text-[#135bec] hover:underline">Privacy Policy</a>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#135bec] py-3.5 text-sm font-bold leading-normal text-white shadow-[0_0_15px_rgba(19,91,236,0.5)] transition-all hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(19,91,236,0.6)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#111722] disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {loading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
             ) : 'Create Account'}
          </button>
        </form>

        {/* Change Mode Link (if not inviting) */}
        {!inviteToken && (
           <div className="mt-4 text-center">
             <button 
                type="button" 
                onClick={() => setMode(mode === 'owner' ? 'join' : 'owner')}
                className="text-xs text-slate-500 hover:text-[#135bec] underline"
             >
                {mode === 'owner' ? 'Have an invite code? Join a team instead.' : 'Want to create a new team? Click here.'}
             </button>
           </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-70 grayscale transition-all hover:grayscale-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#92a4c9]">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>SOC2 Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#92a4c9]">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>256-bit Encryption</span>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-[#92a4c9]">
          Already have an account? <Link href="/auth" className="font-semibold text-[#135bec] hover:underline">Log in</Link>
        </p>
      </div>

      {/* Right Column: Visuals */}
      <div className="relative hidden lg:block lg:w-1/2 overflow-hidden bg-[#101622]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Abstract blue 3D node network visualization representing data infrastructure" 
            className="h-full w-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcBZWq_6riN2C0iFdQN-X6NA7Ice4i08UyWctttBCbYeFV5q58fxdDKlPwgDbnVTrjwuwnfR2Wldopf8DwUVQX9QG237EebGTVdEZHKnfSSKQizr3khg0jk_PZ4afc4GPWlFIZvE9jUjBJxcCiNHd4QSBlmp2BBYt91vtvMhBwgHnN6Op011eIKG1g51jnPBra-f4EfkeGXWwvplLmyXg1yPb72Sfn-ULO1NtlLSv-YkzgDEkOIhXIsrZ1QH9gqdMUd8LFgz3mEQA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101622] via-[#101622]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
        </div>

        {/* Floating Content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-16 pb-20">
          <div className="mb-12 space-y-8">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 backdrop-blur-sm bg-[#101622]/40 p-4 rounded-xl border border-white/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#135bec]/20 text-[#135bec]">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
                <p className="mt-1 text-sm text-slate-300">Automatic anomaly detection and predictive analytics for your revenue streams.</p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-start gap-4 backdrop-blur-sm bg-[#101622]/40 p-4 rounded-xl border border-white/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Unified Operations</h3>
                <p className="mt-1 text-sm text-slate-300">Connect CRM, ERP, and Banking layers in one seamless interface.</p>
              </div>
            </div>
          </div>

          <div>
            <blockquote className="text-xl font-medium leading-relaxed text-white">
                "Enterprise OS has completely transformed how we manage our global infrastructure. It's the nervous system of our company."
            </blockquote>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20">
                <img 
                    alt="Portrait of a business executive" 
                    className="h-full w-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZGtw8XFZbRAlWZsj6xwJxprkG-mm7f0S20jIKaTmw7T6Z0z4vfE-AExvDrR0oXlMndvHr0MmPyxBfWaLWhivp7G7vw3JwI6NsDWpRiHxMUCr6Y_NShiRkdddVP0_TD4kSkBpNpNttCeBzlKN0xZHzUdbHba4b6abtyCEYZiZqJLKCSoNhRIHztE3uPXumCs6_KQTKMuiQI7h9yQq0Pjwmpsy15EH-xnw_i5ZkuHnovTQO7LWPRYGTd_0EiJQU9Lipql2SOFTz-8M"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">David Chen</div>
                <div className="text-xs text-slate-400">CTO at Nexus Industries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f8] dark:bg-[#101622]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
