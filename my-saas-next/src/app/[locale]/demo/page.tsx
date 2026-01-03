'use client';

import { useState } from 'react';
import { DemoFeatureCard } from '@/components/demo/DemoFeatureCard';
import { GuidedTour, TourStep } from '@/components/demo/GuidedTour';
import {
  Brain,
  Shield,
  MessageSquare,
  Users,
  CreditCard,
  ScrollText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  generateDemoCEODigest,
  generateDemoInvoices,
  generateDemoDocuments,
  generateDemoTeam,
  generateDemoAuditLogs,
  getDemoRAGResponse,
  validateInvoiceWithAI,
} from '@/lib/demo-data';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function DemoPage() {
  const [chatInput, setChat Input] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [invoiceForm, setInvoiceForm] = useState({ amount: 50000, discount: 15, dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') });
  const [validationResult, setValidationResult] = useState<{ valid: boolean; reason?: string } | null>(null);

  const ceoDigest = generateDemoCEODigest();
  const invoices = generateDemoInvoices();
  const documents = generateDemoDocuments();
  const team = generateDemoTeam();
  const auditLogs = generateDemoAuditLogs();

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setChat Input('');

    // Simulate AI response delay
    setTimeout(() => {
      const response = getDemoRAGResponse(userMessage);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  const handleValidateInvoice = () => {
    const result = validateInvoiceWithAI(invoiceForm);
    setValidationResult(result);
  };

  const tourSteps: TourStep[] = [
    {
      target: '#ceo-digest-card',
      title: 'CEO Digest: AI-Powered Executive Summary',
      content: 'AI reads your business data every morning and creates a 1-paragraph summary with actionable insights. Save 2 hours of manual report reading.',
    },
    {
      target: '#precheck-card',
      title: 'AI Pre-Check: Input Validation',
      content: 'Before saving data, AI validates it against your company SOPs. Prevents costly human errors like excessive discounts or invalid payment terms.',
    },
    {
      target: '#rag-card',
      title: 'Internal RAG: Company Knowledge Base',
      content: 'Chat with your company documents (SOPs, policies). AI answers based ONLY on your data, not the internet. No hallucinations.',
    },
    {
      target: '#team-card',
      title: 'Team Management with RBAC',
      content: 'Granular role-based access control. Owner, Admin, Manager, Staff roles with different permissions enforced at every layer.',
    },
    {
      target: '#audit-card',
      title: 'Audit Logs: Complete Activity Trail',
      content: 'Every action is logged with user, timestamp, IP address. Required for SOC 2 compliance and forensic investigations.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Interactive Demo - No Signup Required
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              See It In <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Action</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Experience the enterprise features in 60 seconds. Everything you see here is fully functional in the actual codebase.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* CEO Digest */}
          <div id="ceo-digest-card">
            <DemoFeatureCard
              title="CEO Digest"
              description="AI-powered executive summaries generated every morning"
              icon={Brain}
              gradient="from-blue-500 to-cyan-600"
              demoComponent={
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {ceoDigest.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${(ceoDigest.metrics.totalRevenue / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {ceoDigest.metrics.activeProjects}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Active Projects</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ceoDigest.insights.map((insight, i) => (
                      <div key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="shrink-0">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              }
              codeSnippet={`// services/ceoDigestService.ts
const digest = await AiService.generateText({
  prompt: \`Analyze this data and create 
  a 1-paragraph executive summary:
  \${JSON.stringify(businessMetrics)}\`,
  model: 'gemini-pro'
});`}
            />
          </div>

          {/* AI Pre-Check */}
          <div id="precheck-card">
            <DemoFeatureCard
              title="AI Pre-Check"
              description="Validate inputs against company SOPs before saving"
              icon={Shield}
              gradient="from-purple-500 to-pink-600"
              demoComponent={
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Amount (cents)</label>
                      <Input
                        type="number"
                        value={invoiceForm.amount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Discount (%)</label>
                      <Input
                        type="number"
                        value={invoiceForm.discount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Due Date</label>
                    <Input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleValidateInvoice} className="w-full">
                    🤖 Validate with AI
                  </Button>

                  {validationResult && (
                    <div className={`p-3 rounded-lg border ${validationResult.valid ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
                      <p className={`text-sm ${validationResult.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {validationResult.valid ? '✅ Validation passed!' : validationResult.reason}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                    💡 Try entering discount &gt; 20% to see AI reject it
                  </div>
                </div>
              }
              codeSnippet={`// AI validates against SOP rules
const validation = await preCheckService.validate({
  entity: 'invoice',
  data: formData,
  rules: ['discount_limit', 'payment_terms']
});

if (!validation.valid) {
  throw new Error(validation.reason);
}`}
            />
          </div>

          {/* RAG Chat */}
          <div id="rag-card">
            <DemoFeatureCard
              title="Internal RAG"
              description="Chat with your company documents, not the internet"
              icon={MessageSquare}
              gradient="from-green-500 to-emerald-600"
              demoComponent={
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                        Ask about password policy, discount rules, remote work, or SOC 2 compliance
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 border'}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask: What's our password policy?"
                      className="flex-1"
                    />
                    <Button type="submit">Send</Button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {['What is our password policy?', 'Maximum discount allowed?', 'Remote work hours?'].map((q) => (
                      <Button
                        key={q}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setChatMessages([{ role: 'user', content: q }]);
                          setTimeout(() => {
                            setChatMessages((prev) => [...prev, { role: 'assistant', content: getDemoRAGResponse(q) }]);
                          }, 800);
                        }}
                        className="text-xs"
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              }
              codeSnippet={`// RAG searches your documents only
const results = await db.query(
  'SELECT * FROM documents WHERE embedding <-> $1 LIMIT 3',
  [questionEmbedding]
);

const context = results.map(d => d.content).join('\\n');
const answer = await ai.chat(\`Answer based on: \${context}\`);`}
            />
          </div>

          {/* Team Management */}
          <div id="team-card">
            <DemoFeatureCard
              title="Team & RBAC"
              description="Role-based access control enforced at every layer"
              icon={Users}
              gradient="from-orange-500 to-red-600"
              demoComponent={
                <div className="space-y-3">
                  {team.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <img src={member.image} alt={member.name} className="h-10 w-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{member.email}</div>
                      </div>
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                    🔒 Permissions enforced at middleware, API, and UI levels
                  </div>
                </div>
              }
              codeSnippet={`// Middleware checks permissions
if (!hasPermission(user.role, 'delete:invoice')) {
  return new Response('Forbidden', { status: 403 });
}

// UI hides unauthorized actions
<RBACWrapper requiredRole="admin">
  <DeleteButton />
</RBACWrapper>`}
            />
          </div>

          {/* Audit Logs */}
          <div id="audit-card" className="md:col-span-2">
            <DemoFeatureCard
              title="Audit Logs"
              description="Complete activity trail for SOC 2 compliance"
              icon={ScrollText}
              gradient="from-indigo-500 to-purple-600"
              demoComponent={
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                      <div className="shrink-0 w-16 text-xs text-gray-500 dark:text-gray-400">
                        {format(log.createdAt, 'HH:mm')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.entity}
                          </Badge>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{log.details}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          by {log.userName} ({log.userRole}) • {log.ipAddress}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
              codeSnippet={`// Auto-logged by service layer
await auditLogService.create({
  action: 'invoice.created',
  entity: 'billing',
  details: \`Created \${invoice.id}\`,
  userId: currentUser.id,
  teamId: currentUser.teamId,
  ipAddress: req.ip
});`}
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your SaaS?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              All these features are production-ready in the codebase. Get 200+ hours of development for $199.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Full Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Guided Tour */}
      <GuidedTour steps={tourSteps} />
    </div>
  );
}
