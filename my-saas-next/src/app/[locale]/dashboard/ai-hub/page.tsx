'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Role, ROLE_INFO } from '@/types';
import { CEODigest, PreCheckResult, DocumentCategory, DOCUMENT_TYPES } from '@/types/ceoDigest';
import { AiFeedback } from '@/components/ai/AiFeedback';
import { getErrorMessage } from '@/lib/error-utils';



type TabType = 'dashboard' | 'ceo-digest' | 'pre-check' | 'privacy' | 'chat';

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [userRole, setUserRole] = useState<Role>('STAFF');
  
  useEffect(() => {
    const role = localStorage.getItem('role') as Role;
    if (role) setUserRole(role);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101922]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1a2632] border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600">
                <span className="text-xl">←</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Hub
                </h1>
                <p className="text-sm text-gray-500">Intelligence & Automation Center</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                {ROLE_INFO[userRole]?.icon} {ROLE_INFO[userRole]?.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1a2632] border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-6 overflow-x-auto">
            <TabButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon="📊"
              label="Overview"
            />
            <TabButton 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')}
              icon="💬"
              label="Chat Assistant"
            />
            {userRole === 'ADMIN' && (
              <TabButton 
                active={activeTab === 'ceo-digest'} 
                onClick={() => setActiveTab('ceo-digest')}
                icon="👔"
                label="CEO Digest"
              />
            )}
            <TabButton 
              active={activeTab === 'pre-check'} 
              onClick={() => setActiveTab('pre-check')}
              icon="✅"
              label="AI Pre-Check"
            />
            <TabButton 
              active={activeTab === 'privacy'} 
              onClick={() => setActiveTab('privacy')}
              icon="🔒"
              label="Privacy Layer"
            />
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <OverviewTab />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'ceo-digest' && userRole === 'ADMIN' && <CEODigestTab />}
        {activeTab === 'pre-check' && <PreCheckTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </main>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'border-indigo-600 text-indigo-600' 
          : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

// Overview Tab
function OverviewTab() {
  const [stats, setStats] = useState({ requests: 0, tokens: 0, documents: 0, issues: 0 });

  useEffect(() => {
     const fetchStats = async () => {
        const teamId = localStorage.getItem('currentTeamId');
        if (teamId) {
            // Since we can't easily import server action in this file without setting it up as a separate module
            // We will fetch from a new API route or use the server action if properly imported.
            // Let's stick to using the server action via a wrapper or just creating a useEffect fetch to an API.
            // Actually, for "use client", importing a server action works if the action has "use server" at top.
            // But to avoid build complexity if not set up, I'll create a simple API route /api/ai/stats
            
            try {
              const res = await fetch(`/api/ai/stats?teamId=${teamId}`);
              const data = await res.json();
              if (data.success) setStats(data.data);
            } catch (e) {
              console.error("Failed to load stats", e);
            }
        }
     };
     fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon="👔"
          title="CEO Digest"
          description="Ringkasan bisnis harian dengan rekomendasi AI strategis"
          color="purple"
        />
        <FeatureCard 
          icon="✅"
          title="AI Pre-Check"
          description="Validasi dokumen otomatis: Format, Konsistensi, Kepatuhan"
          color="green"
        />
        <FeatureCard 
          icon="💬"
          title="Internal RAG"
          description="Chatbot pintar dengan knowledge base internal"
          color="blue"
        />
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">AI Features Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total AI Requests (Month)</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.requests.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tokens Used</p>
            <p className="text-2xl font-bold text-purple-600">{stats.tokens.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Documents Validated</p>
            <p className="text-2xl font-bold text-green-600">{stats.documents.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Issues Detected</p>
            <p className="text-2xl font-bold text-amber-600">{stats.issues.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  const colorClasses = {
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };
  
  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <span className="text-3xl">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-3">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
    </div>
  );
}

// CEO Digest Tab (ADMIN only)
function CEODigestTab() {
  const [digest, setDigest] = useState<CEODigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateDigest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/ceo-digest', {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setDigest(data.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Gagal generate digest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CEO Digest 👔</h2>
          <p className="text-gray-500">Ringkasan bisnis harian dengan rekomendasi AI</p>
        </div>
        <button
          onClick={generateDigest}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Generating...
            </>
          ) : (
            <>
              <span>🚀</span> Generate Digest
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {digest && (
        <div className="space-y-6">
          {/* WhatsApp-style Briefing */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📱</span>
              <h3 className="font-semibold">WhatsApp-Style Briefing</h3>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-white/10 rounded-lg p-4">
              {digest.briefingMessage}
            </pre>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Summary */}
            <DigestCard title="💰 Ringkasan Keuangan" icon="💰">
              <div className="space-y-3">
                <DigestRow label="Saldo Kas" value={`Rp ${(digest.financial.cashFlow.closingBalance / 1000000).toFixed(0)} jt`} />
                <DigestRow label="Estimasi Pengeluaran Hari Ini" value={`Rp ${(digest.financial.cashFlow.estimatedExpensesToday / 1000000).toFixed(0)} jt`} />
                <DigestRow 
                  label="Revenue Kemarin" 
                  value={`${digest.financial.revenue.achievementPercent}% target`} 
                  highlight={digest.financial.revenue.achievementPercent >= 100}
                />
                <DigestRow label="Piutang Jatuh Tempo" value={`${digest.financial.receivables.overdueCount} tagihan`} warning />
              </div>
            </DigestCard>

            {/* Operational Summary */}
            <DigestCard title="📊 Performa Operasional" icon="📊">
              <div className="space-y-3">
                <DigestRow label="KPI Bulanan" value={`${digest.operational.kpiProgress.percentComplete}%`} />
                <DigestRow label="Sisa Hari" value={`${digest.operational.kpiProgress.daysRemaining} hari`} />
                <DigestRow label="Leads Baru" value={digest.operational.salesPipeline.newLeads.toString()} />
                <DigestRow label="Deals Aktif" value={digest.operational.salesPipeline.activeDeals.toString()} />
                <DigestRow label="Tiket Terbuka" value={digest.operational.customerHealth.openTickets.toString()} />
              </div>
            </DigestCard>

            {/* Strategic Projects */}
            <DigestCard title="📋 Proyek Strategis" icon="📋">
              <div className="space-y-2">
                {digest.productivity.strategicProjects.map((project, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'on-track' ? 'bg-green-100 text-green-700' :
                      project.status === 'at-risk' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {project.status === 'on-track' ? '✓ On Track' : 
                       project.status === 'at-risk' ? '⚠ At Risk' : '❌ Behind'}
                    </span>
                  </div>
                ))}
              </div>
            </DigestCard>

            {/* Anomaly & Risks */}
            <DigestCard title="⚠️ Anomali & Risiko" icon="⚠️">
              <div className="space-y-3">
                {digest.risks.anomalies.map((anomaly, i) => (
                  <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{anomaly.description}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{anomaly.affectedArea}</p>
                  </div>
                ))}
                {digest.risks.compliance.map((item, i) => (
                  <div key={i} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{item.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">Expires: {item.expiryDate} ({item.daysUntilExpiry} hari lagi)</p>
                  </div>
                ))}
              </div>
            </DigestCard>
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">🎯 Prioritas Hari Ini (AI Recommendations)</h3>
            <div className="space-y-3">
              {digest.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/10 rounded-lg">
                  <span className="text-2xl font-bold">{rec.priority}</span>
                  <div>
                    <p className="font-medium">{rec.action}</p>
                    <p className="text-sm text-white/80 mt-1">{rec.reason}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                      rec.urgency === 'immediate' ? 'bg-red-500' :
                      rec.urgency === 'today' ? 'bg-amber-500' : 'bg-green-500'
                    }`}>
                      {rec.urgency === 'immediate' ? '🔴 Segera' :
                       rec.urgency === 'today' ? '🟡 Hari Ini' : '🟢 Minggu Ini'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!digest && !loading && (
        <div className="bg-white dark:bg-[#1a2632] rounded-xl p-12 border border-gray-200 dark:border-slate-700 text-center">
          <span className="text-6xl">📊</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">Belum Ada Digest</h3>
          <p className="text-gray-500 mt-2">Klik tombol "Generate Digest" untuk membuat ringkasan bisnis hari ini</p>
        </div>
      )}
    </div>
  );
}

function DigestCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1a2632] rounded-xl p-6 border border-gray-200 dark:border-slate-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function DigestRow({ label, value, highlight, warning }: { label: string; value: string; highlight?: boolean; warning?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`font-semibold ${
        highlight ? 'text-green-600' : 
        warning ? 'text-amber-600' : 
        'text-gray-900 dark:text-white'
      }`}>{value}</span>
    </div>
  );
}

// Pre-Check Tab
function PreCheckTab() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('financial');
  const [documentType, setDocumentType] = useState('Invoice');
  const [result, setResult] = useState<PreCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runValidation = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/precheck', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, category, documentType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.data);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Pre-Check ✅</h2>
        <p className="text-gray-500">Validasi dokumen otomatis dengan 3 level: Format, Konsistensi, Kepatuhan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white dark:bg-[#1a2632] rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📄 Input Dokumen</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as DocumentCategory);
                  setDocumentType(DOCUMENT_TYPES[e.target.value as DocumentCategory][0]);
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="financial">💰 Keuangan</option>
                <option value="legal">⚖️ Legal</option>
                <option value="operational">📋 Operasional</option>
                <option value="communication">📧 Komunikasi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Dokumen</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                {DOCUMENT_TYPES[category].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konten Dokumen
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 font-mono text-sm"
              placeholder="Paste konten dokumen di sini untuk divalidasi..."
            />
            <p className="text-xs text-gray-400 mt-1">{content.length} karakter</p>
          </div>

          <button
            onClick={runValidation}
            disabled={loading || !content.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
          >
            {loading ? '⏳ Validating...' : '🔍 Run Validation'}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-white dark:bg-[#1a2632] rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📊 Hasil Validasi</h3>
          
          {result ? (
            <div className="space-y-4">
              {/* Score */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <p className="text-5xl font-bold text-indigo-600">{result.score}</p>
                <p className="text-sm text-gray-500 mt-1">Score</p>
                <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-medium ${
                  result.overallStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  result.overallStatus === 'needs-review' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.overallStatus === 'approved' ? '✅ Approved' :
                   result.overallStatus === 'needs-review' ? '⚠️ Needs Review' : '❌ Rejected'}
                </span>
              </div>

              {/* Validation Levels */}
              <div className="space-y-2">
                <ValidationRow 
                  label="Format" 
                  passed={result.validations.format.passed} 
                  message={result.validations.format.message}
                />
                <ValidationRow 
                  label="Konsistensi" 
                  passed={result.validations.consistency.passed} 
                  message={result.validations.consistency.message}
                />
                <ValidationRow 
                  label="Kepatuhan" 
                  passed={result.validations.compliance.passed} 
                  message={result.validations.compliance.message}
                />
              </div>

              {/* Sensitive Data Warning */}
              {result.sensitiveDataFound && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-700">⚠️ Data Sensitif Terdeteksi!</p>
                  <p className="text-xs text-red-600">Dokumen mengandung PII yang perlu dimasking</p>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">💡 Saran Perbaikan</h4>
                  <ul className="space-y-1">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span>•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {result.risks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🚨 Risiko</h4>
                  <div className="space-y-2">
                    {result.risks.map((r, i) => (
                      <div key={i} className={`p-2 rounded-lg border text-sm ${
                        r.severity === 'high' ? 'bg-red-50 border-red-200 text-red-700' :
                        r.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        <p className="font-medium">{r.issue}</p>
                        <p className="text-xs mt-1">{r.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl">📝</span>
              <p className="mt-2">Hasil validasi akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ValidationRow({ label, passed, message }: { label: string; passed: boolean; message: string }) {
  return (
    <div className={`p-3 rounded-lg border ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center gap-2">
        <span>{passed ? '✅' : '❌'}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <p className="text-xs text-gray-600 mt-1">{message}</p>
    </div>
  );
}

// Privacy Tab
// Privacy Tab
function PrivacyTab() {
  const [settings, setSettings] = useState({
    globalEnabled: true,
    activeRules: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/privacy', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSettings({
            globalEnabled: data.globalEnabled,
            activeRules: data.stats.activeRules
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleGlobal = async () => {
      // Optimistic update
      const newState = !settings.globalEnabled;
      setSettings(prev => ({ ...prev, globalEnabled: newState }));
      
      try {
        await fetch('/api/privacy', {
            method: 'PUT',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ globalEnabled: newState })
        });
      } catch (e) {
         // Revert on error
         setSettings(prev => ({ ...prev, globalEnabled: !newState }));
      }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Layer 🔒</h2>
        <p className="text-gray-500">PII Masking & Data Protection Settings</p>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-xl p-8 border border-gray-200 dark:border-slate-700 flex flex-col items-center text-center gap-6">
          <div className={`p-4 rounded-full ${settings.globalEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <span className="material-symbols-outlined text-4xl">
                  {settings.globalEnabled ? 'verified_user' : 'privacy_tip'}
              </span>
          </div>
          
          <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Privacy Layer is {settings.globalEnabled ? 'Active' : 'Disabled'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                  {settings.globalEnabled 
                    ? `Protecting sensitive data with ${settings.activeRules} active masking rules before sending to AI providers.`
                    : "PII masking is disabled. Sensitive data might be exposed to AI providers."
                  }
              </p>
          </div>

          <button
            onClick={toggleGlobal}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                settings.globalEnabled 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {settings.globalEnabled ? 'Disable Protection' : 'Enable Protection'}
          </button>
          
          <div className="pt-6 border-t border-gray-100 dark:border-slate-700 w-full">
              <Link href="/dashboard/privacy-layer" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-2">
                  <span>Configure Rules & Settings</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
          </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
      >
        <span className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}


// Chat Tab Component
function ChatTab() {
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([
    { id: '1', role: 'assistant', content: 'Halo! Saya AI Assistant Anda. Saya bisa membantu mencari dokumen internal atau membuat invoice. Ada yang bisa saya bantu?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState<string>(''); // Should get from context

  useEffect(() => {
    // Quick hack to get teamId from localStorage or API (Ideally use a proper hook)
    const storedTeamId = localStorage.getItem('currentTeamId');
    if (storedTeamId) setTeamId(storedTeamId);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: crypto.randomUUID(), role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'x-user-id': ... // pass if needed
        },
        body: JSON.stringify({ message: input, teamId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      const aiMsg = { id: data.id, role: 'assistant' as const, content: data.content };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Maaf, terjadi kesalahan.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[600px] flex flex-col bg-white dark:bg-[#1a2632] rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Feedback for Assistant Messages */}
                        {msg.role === 'assistant' && msg.id !== '1' && msg.id !== 'err' && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <AiFeedback 
                                    messageId={msg.id} 
                                    teamId={teamId} 
                                    className="scale-90"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-bl-none p-4 text-gray-500 text-sm">
                        Sedang mengetik...
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Tanya sesuatu atau perintahkan saya..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
  );
}
