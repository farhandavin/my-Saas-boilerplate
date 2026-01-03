'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Users, Upload, CreditCard, Check, 
  ArrowRight, ArrowLeft, Building2, Briefcase 
} from 'lucide-react';
import { showToast } from '@/components/ui/ToastProvider';

const STEPS = [
  { id: 1, title: 'Welcome', icon: Sparkles, description: 'Selamat datang di Business OS' },
  { id: 2, title: 'Organization', icon: Building2, description: 'Setup organisasi Anda' },
  { id: 3, title: 'Team', icon: Users, description: 'Undang tim Anda' },
  { id: 4, title: 'Knowledge', icon: Upload, description: 'Upload dokumen pertama' },
  { id: 5, title: 'Plan', icon: CreditCard, description: 'Pilih paket Anda' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '',
    industry: '',
    teamSize: '',
    inviteEmails: [''],
    documentTitle: '',
    documentContent: '',
    selectedPlan: 'FREE',
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // const token = localStorage.getItem('token');
      
      // Save onboarding progress
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orgName: formData.orgName,
          industry: formData.industry,
          teamSize: formData.teamSize,
          selectedPlan: formData.selectedPlan,
        })
      });

      showToast.success('Onboarding selesai!', 'Selamat datang di Business OS');
      router.push('/dashboard');
    } catch (error) {
      showToast.error('Terjadi kesalahan', 'Silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex">
      {/* Sidebar Progress */}
      <aside className="hidden lg:flex w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 flex-col p-8">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-white">Business OS</h1>
          <p className="text-white/60 text-sm mt-1">Setup Wizard</p>
        </div>

        <nav className="flex-1 space-y-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white/10 border border-white/20' 
                    : isCompleted 
                    ? 'opacity-60' 
                    : 'opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-emerald-500' 
                    : isActive 
                    ? 'bg-indigo-500' 
                    : 'bg-white/10'
                }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{step.title}</p>
                  <p className="text-white/50 text-xs">{step.description}</p>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <p className="text-white/40 text-xs">Langkah {currentStep} dari 5</p>
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Welcome */}
              {currentStep === 1 && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Selamat Datang di Business OS
                  </h2>
                  <p className="text-white/60 mb-8 leading-relaxed">
                    Platform all-in-one untuk mengelola bisnis Anda dengan bantuan AI. 
                    Mari kita mulai dengan menyiapkan akun Anda dalam beberapa langkah mudah.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-2xl block mb-2">🤖</span>
                      <p className="text-white/80 text-sm">AI Assistant</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-2xl block mb-2">📊</span>
                      <p className="text-white/80 text-sm">CEO Digest</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-2xl block mb-2">🔒</span>
                      <p className="text-white/80 text-sm">Multi-tenant</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Organization Setup */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Setup Organisasi
                  </h2>
                  <p className="text-white/60 mb-8">
                    Beritahu kami tentang bisnis Anda
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Nama Organisasi</label>
                      <input
                        type="text"
                        value={formData.orgName}
                        onChange={(e) => updateFormData('orgName', e.target.value)}
                        placeholder="PT. Contoh Indonesia"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Industri</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => updateFormData('industry', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="" className="bg-slate-800">Pilih industri</option>
                        <option value="tech" className="bg-slate-800">Teknologi</option>
                        <option value="finance" className="bg-slate-800">Keuangan</option>
                        <option value="retail" className="bg-slate-800">Retail</option>
                        <option value="manufacturing" className="bg-slate-800">Manufaktur</option>
                        <option value="healthcare" className="bg-slate-800">Healthcare</option>
                        <option value="other" className="bg-slate-800">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Ukuran Tim</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['1-10', '11-50', '50+'].map(size => (
                          <button
                            key={size}
                            onClick={() => updateFormData('teamSize', size)}
                            className={`p-3 rounded-xl border transition-all ${
                              formData.teamSize === size
                                ? 'bg-indigo-500 border-indigo-400 text-white'
                                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {size} orang
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Invite Team */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Undang Tim Anda
                  </h2>
                  <p className="text-white/60 mb-8">
                    Opsional - Anda bisa melakukan ini nanti
                  </p>
                  <div className="space-y-4">
                    {formData.inviteEmails.map((email, index) => (
                      <input
                        key={index}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...formData.inviteEmails];
                          newEmails[index] = e.target.value;
                          updateFormData('inviteEmails', newEmails);
                        }}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ))}
                    <button
                      onClick={() => updateFormData('inviteEmails', [...formData.inviteEmails, ''])}
                      className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2"
                    >
                      + Tambah email lain
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Upload Knowledge */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Upload Dokumen Pertama
                  </h2>
                  <p className="text-white/60 mb-8">
                    AI akan belajar dari dokumen ini untuk menjawab pertanyaan tim Anda
                  </p>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={formData.documentTitle}
                      onChange={(e) => updateFormData('documentTitle', e.target.value)}
                      placeholder="Judul dokumen (mis: SOP Cuti)"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      value={formData.documentContent}
                      onChange={(e) => updateFormData('documentContent', e.target.value)}
                      placeholder="Paste konten dokumen di sini..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <p className="text-white/40 text-xs">
                      Anda bisa melewati langkah ini dan upload dokumen nanti di Knowledge Base
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Select Plan */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Pilih Paket Anda
                  </h2>
                  <p className="text-white/60 mb-8">
                    Mulai gratis, upgrade kapan saja
                  </p>
                  <div className="space-y-4">
                    {[
                      { id: 'FREE', name: 'Free', price: 'Rp 0', features: ['500 AI tokens/bulan', '3 anggota tim', 'Shared database'] },
                      { id: 'PRO', name: 'Pro', price: 'Rp 299k', features: ['50.000 AI tokens/bulan', '20 anggota tim', 'Schema isolation'], popular: true },
                      { id: 'ENTERPRISE', name: 'Enterprise', price: 'Rp 999k', features: ['500.000 AI tokens/bulan', 'Unlimited tim', 'Isolated database'] },
                    ].map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => updateFormData('selectedPlan', plan.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all relative ${
                          formData.selectedPlan === plan.id
                            ? 'bg-indigo-500/20 border-indigo-400'
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2 right-4 px-2 py-0.5 bg-amber-500 text-amber-900 text-xs font-bold rounded-full">
                            POPULAR
                          </span>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-semibold">{plan.name}</span>
                          <span className="text-white/80">{plan.price}/bulan</span>
                        </div>
                        <ul className="text-white/50 text-sm space-y-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-emerald-400" /> {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Selesai'}
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Skip Link */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full mt-6 text-center text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            Lewati untuk sekarang
          </button>
        </div>
      </main>
    </div>
  );
}
