'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      role: 'Owner',
      useCase: 'Business Management',
      teamSize: '1-10',
      industry: 'Technology',
      dataRegion: 'id' // Default to Indonesia
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const completeOnboarding = async () => {
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/onboarding/complete', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(formData)
          });
          
          if (res.ok) {
              showSuccess('Setup complete! Redirecting...');
              setTimeout(() => router.push('/dashboard'), 1500);
          } else {
              showError('Failed to complete onboarding');
              setLoading(false);
          }
      } catch (error) {
          showError('Something went wrong');
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#101922] p-4">
       <div className="w-full max-w-2xl bg-white dark:bg-[#1a2332] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
           
           {/* Progress Bar */}
           <div className="h-1.5 bg-gray-100 dark:bg-gray-800 w-full">
               <div 
                className="h-full bg-[#135bec] transition-all duration-500 ease-out" 
                style={{ width: `${(step / 3) * 100}%` }}
               ></div>
           </div>

           <div className="p-8 md:p-12">
               
               {/* Step 1: Role */}
               {step === 1 && (
                   <div className="animate-fade-in">
                       <div className="text-center mb-10">
                           <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-[#135bec] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">👋</div>
                           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Enterprise OS</h1>
                           <p className="text-gray-500 text-lg">Let's personalize your workspace properly. What is your role?</p>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                           {['Owner', 'Manager', 'Developer', 'Freelancer'].map(role => (
                               <button 
                                key={role}
                                onClick={() => setFormData({...formData, role})}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    formData.role === role 
                                    ? 'border-[#135bec] bg-[#135bec]/5 ring-1 ring-[#135bec]' 
                                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                               >
                                   <span className="block font-bold text-gray-900 dark:text-white">{role}</span>
                               </button>
                           ))}
                       </div>
                       
                       <button onClick={handleNext} className="w-full py-3.5 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                           Continue
                       </button>
                   </div>
               )}


               {/* Step 2: Details */}
               {step === 2 && (
                   <div className="animate-fade-in">
                        <div className="text-center mb-8">
                           <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tell us about your team</h1>
                           <p className="text-gray-500">This helps us customize your dashboard widgets.</p>
                       </div>

                       <div className="space-y-6 mb-8">
                           <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Company Size</label>
                               <div className="grid grid-cols-3 gap-3">
                                   {['1-10', '11-50', '50+'].map(size => (
                                       <button 
                                            key={size}
                                            onClick={() => setFormData({...formData, teamSize: size})}
                                            className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                                                formData.teamSize === size 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-[#135bec] text-[#135bec]' 
                                                : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                       >
                                           {size}
                                       </button>
                                   ))}
                               </div>
                           </div>

                           <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Primary Industry</label>
                               <select 
                                value={formData.industry}
                                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151b26] py-3 text-gray-900 dark:text-white focus:ring-[#135bec]"
                               >
                                   <option>Technology</option>
                                   <option>Finance</option>
                                   <option>Healthcare</option>
                                   <option>Retail</option>
                                   <option>Other</option>
                               </select>
                           </div>

                           {/* Data Residency - ADDED FOR COMPLIANCE */}
                           <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Data Residency</label>
                               <div className="grid grid-cols-2 gap-4">
                                   <button
                                     onClick={() => setFormData({...formData, dataRegion: 'id'})}
                                     className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                        formData.dataRegion === 'id'
                                        ? 'border-[#135bec] bg-blue-50 dark:bg-blue-900/20 ring-1 ring-[#135bec]'
                                        : 'border-gray-200 dark:border-gray-700'
                                     }`}
                                   >
                                       <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                           🇮🇩 Indonesia
                                       </span>
                                       <span className="text-xs text-gray-500">Jakarta (ap-southeast-3)</span>
                                   </button>
                                   <button
                                     onClick={() => setFormData({...formData, dataRegion: 'global'})}
                                     className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                        formData.dataRegion === 'global'
                                        ? 'border-[#135bec] bg-blue-50 dark:bg-blue-900/20 ring-1 ring-[#135bec]'
                                        : 'border-gray-200 dark:border-gray-700'
                                     }`}
                                   >
                                       <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                           🌏 Global
                                       </span>
                                       <span className="text-xs text-gray-500">Singapore (ap-southeast-1)</span>
                                   </button>
                               </div>
                               <p className="text-xs text-gray-500 mt-2">
                                   *Pilih Indonesia untuk mematuhi regulasi lokal (GR 71/2019).
                               </p>
                           </div>
                       </div>

                       <div className="flex gap-4">
                           <button onClick={handleBack} className="w-1/3 py-3.5 border border-gray-200 dark:border-gray-700 font-bold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                               Back
                           </button>
                           <button onClick={handleNext} className="w-2/3 py-3.5 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                               Continue
                           </button>
                       </div>
                   </div>
               )}

               {/* Step 3: Confirmation */}
               {step === 3 && (
                   <div className="text-center animate-fade-in py-8">
                       <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                           <span className="material-symbols-outlined text-5xl">rocket_launch</span>
                       </div>
                       <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">You're all set!</h1>
                       <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">We have configured your workspace based on your profile using our "Enterprise Standard" preset.</p>
                       
                       <button 
                        onClick={completeOnboarding}
                        disabled={loading}
                        className="w-full max-w-sm mx-auto py-4 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                       >
                           {loading && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
                           Go to Dashboard
                       </button>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}
