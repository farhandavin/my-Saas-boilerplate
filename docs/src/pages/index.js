import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Enterprise OS Documentation</title>
        <meta name="description" content="Comprehensive guide for Enterprise Business OS" />
      </Head>
      <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display antialiased flex flex-col min-h-screen">
      {/* Top Navigation Bar from Design */}
      <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-background-light/95 dark:bg-background-dark/95 backdrop-blur supports-[backdrop-filter]:bg-background-light/60">
        <div className="flex h-16 items-center px-4 md:px-8 max-w-[1600px] mx-auto">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" to="/">
              <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined">dataset</span>
              </div>
              <span className="hidden font-bold sm:inline-block text-lg tracking-tight">Enterprise OS</span>
            </Link>
          </div>
          {/* Mobile Menu Trigger */}
          <button 
            className="inline-flex items-center justify-center rounded-md p-2 text-text-muted hover:bg-background-subtle hover:text-text-main md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {/* Right side spacer */}
          <div className="flex flex-1 items-center justify-end">
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex items-start">
        {/* Left Sidebar (Navigation) */}
        <aside className={`fixed top-16 z-30 -ml-2 h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block md:w-72 overflow-y-auto border-r border-border-light dark:border-border-dark py-6 pr-4 pl-4 lg:pl-8 bg-background-light dark:bg-background-dark transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-2' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-col gap-1">
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:no-underline" to="/docs/buyers-guide">
              Buyer's Guide
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/product-specification">
              Product Specs
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/installation">
              Installation Guide
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/ARCHITECTURE">
              Architecture Overview
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/BRANDING">
              Branding & Theming Guide
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/COMPARISON">
              Competitive Comparison
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/CRON">
              Cron Jobs & Background Tasks
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/CUSTOMIZATION">
              Customization & Whitelabeling
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/DEPLOYMENT">
              Deployment Guide (Vercel)
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/FAQ">
              Frequently Asked Questions
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/LOAD_TESTING">
              Load Testing Guide
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/MIGRATION_GUIDE">
              Migration Guide
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/QUICK_START">
              Quick Start Guide
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/ROADMAP">
              Product Roadmap
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/SECURITY">
              Security Primer
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/TROUBLESHOOTING">
              Troubleshooting Guide
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/VISUAL_ASSETS">
              Visual Marketing Assets
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/ai-services">
              AI Services Documentation
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/auth">
              Authentication Service
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/backend-architecture">
              Backend Architecture
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/billing">
              Billing & Monetization
            </Link>
            <Link className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/frontend-architecture">
              Frontend Architecture
            </Link>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="relative py-8 px-6 md:px-12 lg:px-16 w-full max-w-5xl">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center space-x-1 text-sm text-text-muted">
            <Link className="hover:text-primary hover:underline" to="/">Docs</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-medium text-text-main dark:text-white">Introduction</span>
          </div>

          {/* Page Title Area */}
          <div className="space-y-4 mb-10">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-text-main dark:text-white">
              Enterprise Business OS Documentation
            </h1>
            <p className="text-xl text-text-muted leading-relaxed max-w-3xl">
              Welcome to the comprehensive guide for our Enterprise Business OS. Explore our core modules, integrate with our APIs, and build scalable solutions with AI-driven insights.
            </p>
          </div>

          {/* Hero Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Link className="group relative rounded-xl border border-border-light bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 dark:bg-slate-900 dark:border-border-dark hover:no-underline" to="/docs/buyers-guide#2-ai-native-architecture">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-main dark:text-white">AI Intelligence</h3>
              <p className="text-sm text-text-muted">Learn about our generative insights engine, automated model training, and predictive analytics workflows.</p>
            </Link>
            <Link className="group relative rounded-xl border border-border-light bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 dark:bg-slate-900 dark:border-border-dark hover:no-underline" to="/docs/backend-architecture">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">domain</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-main dark:text-white">B2B Infrastructure</h3>
              <p className="text-sm text-text-muted">Configure multi-tenant environments, manage SSO authentication, and secure enterprise integrations.</p>
            </Link>
            <Link className="group relative rounded-xl border border-border-light bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 dark:bg-slate-900 dark:border-border-dark hover:no-underline" to="/docs/billing">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-main dark:text-white">Payment & Billing</h3>
              <p className="text-sm text-text-muted">Set up global invoicing, configure payment gateways, and ensure automated tax compliance.</p>
            </Link>
            <Link className="group relative rounded-xl border border-border-light bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 dark:bg-slate-900 dark:border-border-dark hover:no-underline" to="/docs/backend-architecture">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-blue-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">shield</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-main dark:text-white">Operational Reliability</h3>
              <p className="text-sm text-text-muted">Monitor uptime SLAs, configure disaster recovery protocols, and access detailed audit logs.</p>
            </Link>
          </div>

          {/* Content Section */}
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-text-main dark:text-white">System Architecture</h2>
            <p className="text-text-muted mb-6">
              The Enterprise OS is designed as a modular, event-driven architecture. Each pillar operates independently but shares a unified data layer, ensuring consistency across your organization.
            </p>
            
            {/* Admonition: TIP */}
            <div className="my-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-900/20 dark:border-emerald-600">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm uppercase">
                <span className="material-symbols-outlined text-lg">lightbulb</span>
                Tip
              </div>
              <p className="text-emerald-900 dark:text-emerald-100 text-sm m-0">
                You can enable specific modules in the <code>config.yaml</code> file before deployment to save resources.
              </p>
            </div>

            {/* Admonition: WARNING */}
            <div className="my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20 dark:border-amber-600">
              <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-400 font-bold text-sm uppercase">
                <span className="material-symbols-outlined text-lg">warning</span>
                Important Requirement
              </div>
              <p className="text-amber-900 dark:text-amber-100 text-sm m-0">
                A valid Enterprise License Key is required to access the Model Training API endpoints. Please contact sales if you need a trial key.
              </p>
            </div>

            <h2 className="text-2xl font-bold tracking-tight mt-10 mb-4 text-text-main dark:text-white">Quick Integration Example</h2>
            <p className="text-text-muted mb-4">
              Initialize the client SDK with your API key to start streaming data to the AI Intelligence module.
            </p>

            {/* Code Block */}
            <div className="relative mt-4 mb-8 rounded-lg bg-[#0d1117] border border-gray-800 overflow-hidden group">
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                <span className="text-xs text-gray-400 font-mono">javascript</span>
                <button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed text-[#c9d1d9]"><code><span className="text-[#ff7b72]">import</span> &#123; EnterpriseClient &#125; <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'@enterprise-os/sdk'</span>;<br/><br/><span class="text-[#8b949e]">// Initialize the client</span><br/><span className="text-[#ff7b72]">const</span> client = <span className="text-[#ff7b72]">new</span> <span className="text-[#d2a8ff]">EnterpriseClient</span>(&#123;<br/>  apiKey: <span className="text-[#a5d6ff]">'eos_live_...'</span>,<br/>  region: <span className="text-[#a5d6ff]">'us-east-1'</span><br/>&#125;);<br/><br/><span class="text-[#8b949e]">// Send data to AI module</span><br/><span className="text-[#ff7b72]">await</span> client.ai.<span className="text-[#d2a8ff]">ingest</span>(&#123;<br/>  source: <span className="text-[#a5d6ff]">'customer_feedback'</span>,<br/>  payload: &#123; text: <span className="text-[#a5d6ff]">'Great service but slow dashboard.'</span> &#125;<br/>&#125;);</code></pre>
              </div>
            </div>
          </div>

          {/* Footer Pagination */}
          <div className="mt-16 flex flex-col md:flex-row items-stretch justify-between gap-4 border-t border-border-light pt-8 dark:border-border-dark">
            <Link className="group flex flex-1 flex-col rounded-lg border border-border-light p-4 transition-all hover:border-primary dark:border-border-dark hover:no-underline" to="#">
              <span className="text-xs font-medium text-text-muted mb-1">Previous</span>
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Welcome
              </div>
            </Link>
            <Link className="group flex flex-1 flex-col items-end rounded-lg border border-border-light p-4 transition-all hover:border-primary dark:border-border-dark hover:no-underline" to="/docs/installation#quickstart">
              <span className="text-xs font-medium text-text-muted mb-1">Next</span>
              <div className="flex items-center gap-2 text-primary font-bold">
                Quickstart Guide
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </Link>
          </div>


        </main>

      </div>
      </div>
    </>
  );
}
