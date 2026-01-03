'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/components/Toast';

export default function UserProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    language: 'en',
    timezone: 'UTC',
    role: 'Administrator', // Read-only derived from auth context usually, but for now we keep it static or could fetch
    twoFactorEnabled: false
  });

  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ 
            ...prev, 
            ...data,
            role: 'Administrator' // Hardcoded for now as it's not editable here and we need to fetch team member role for accuracy
        }));
        setInitialData(data);
      } else {
        showError(data.error || 'Failed to load profile');
      }
    } catch (error) {
      showError('Failed to load profile');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Profile updated successfully');
        setInitialData(formData);
      } else {
        showError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const autoFillWithGemini = async () => {
    setIsAiLoading(true);
    // Simulation of AI autofill
    setTimeout(() => {
        setFormData(prev => ({
            ...prev,
            bio: "Experienced Operations Manager with 8+ years in driving efficiency and team leadership. Passionate about streamlining workflows and leveraging technology to scale business processes."
        }));
        setIsAiLoading(false);
        showSuccess('Bio generated with Gemini');
    }, 1500);
  };

  if (fetching) {
     return (
       <div className="max-w-4xl mx-auto p-6 md:p-10 min-h-[400px] flex items-center justify-center">
         <div className="text-gray-500">Loading profile...</div>
       </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 pb-20 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-[#92a4c9] mt-2">Manage your personal information and security preferences.</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-[#232f48] p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white dark:border-[#1a2332] shadow-md overflow-hidden">
             {/* Fallback to initials if no image */}
             {formData.firstName?.[0]}{formData.lastName?.[0]}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-[#135bec] text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px] block">camera_alt</span>
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</h2>
          <p className="text-gray-500 dark:text-[#92a4c9] text-sm">{formData.role}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
             <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase">Active</span>
             <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">Jakarta, ID</span>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Public Profile
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 dark:border-[#232f48] mb-8 overflow-x-auto">
        <button className="pb-4 text-[#135bec] font-semibold border-b-2 border-[#135bec] text-sm whitespace-nowrap">
           General Info
        </button>
        <button className="pb-4 text-gray-500 hover:text-gray-700 dark:text-[#92a4c9] font-medium text-sm whitespace-nowrap hover:border-b-2 border-gray-300 transition-all">
           Security
        </button>
        <button className="pb-4 text-gray-500 hover:text-gray-700 dark:text-[#92a4c9] font-medium text-sm whitespace-nowrap hover:border-b-2 border-gray-300 transition-all">
           Notifications
        </button>
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Left Column: Form Fields */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Personal Information */}
            <section>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                 <span className="material-symbols-outlined text-gray-400">person</span>
                 Personal Information
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#1a2332] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#1a2332] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#232f48] bg-gray-50 dark:bg-[#151b26] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#1a2332] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all"
                    />
                  </div>
               </div>

               <div>
                 <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                    <button 
                        onClick={autoFillWithGemini}
                        disabled={isAiLoading}
                        className="text-xs font-semibold text-[#135bec] flex items-center gap-1 hover:underline disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        {isAiLoading ? 'Generating...' : 'Auto-fill with Gemini'}
                    </button>
                 </div>
                 <textarea 
                    rows={4} 
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#1a2332] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all resize-none"
                    placeholder="Tell us a little about yourself..."
                 ></textarea>
               </div>
            </section>

            <hr className="border-gray-200 dark:border-[#232f48]" />

            {/* Regional Preferences */}
            <section>
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                 <span className="material-symbols-outlined text-gray-400">public</span>
                 Regional Preferences
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
                     <select 
                        value={formData.language}
                        onChange={(e) => handleChange('language', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#1a2332] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all"
                     >
                        <option value="en">English (United States)</option>
                        <option value="id">Bahasa Indonesia</option>
                        <option value="es">Español</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Timezone</label>
                     <select 
                        value={formData.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#232f48] bg-white dark:bg-[#1a2332] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all"
                     >
                        <option value="UTC">(GMT+00:00) UTC</option>
                        <option value="asia_jakarta">(GMT+07:00) Jakarta</option>
                        <option value="asia_singapore">(GMT+08:00) Singapore</option>
                        <option value="america_new_york">(GMT-04:00) New York</option>
                     </select>
                  </div>
               </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-4">
                <button className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-2.5 bg-[#135bec] hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
         </div>

         {/* Right Column: Security Checks */}
         <div className="space-y-6">
            <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-200 dark:border-[#232f48] p-5 shadow-sm">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4">Security & Login</h3>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#151b26] rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-[#1a2332] rounded-md shadow-sm">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">key</span>
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white">Password</p>
                           <p className="text-xs text-gray-500">Last changed 3 months ago</p>
                        </div>
                     </div>
                     <button className="text-xs font-bold text-[#135bec] hover:underline">Change</button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#151b26] rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-[#1a2332] rounded-md shadow-sm">
                            <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">smartphone</span>
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white">2WA Auth</p>
                           <p className="text-xs text-gray-500">Secure your account</p>
                        </div>
                     </div>
                     <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.twoFactorEnabled}
                            onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#135bec]"></div>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#135bec] to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined bg-white/20 p-2 rounded-lg">verified_user</span>
                    <div>
                        <h4 className="font-bold text-base">Privacy Check</h4>
                        <p className="text-xs text-indigo-100 mt-1 leading-relaxed">Your profile is currently visible to all team members. Adjust settings if needed.</p>
                        <button className="mt-3 text-xs font-bold bg-white text-[#135bec] px-3 py-1.5 rounded shadow-sm hover:bg-indigo-50 transition-colors">
                            Review Settings
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
