import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [aiMenuOpen, setAiMenuOpen] = useState(true); // Default open as in design
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
          {/* Search Bar (Desktop) */}
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
             {/* ... */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
                {/* Search visual only */}
              <button className="inline-flex items-center rounded-lg border border-border-light bg-background-subtle px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-gray-100 hover:text-text-main dark:border-border-dark dark:bg-slate-800 dark:hover:bg-slate-700 w-full md:w-64 lg:w-80 justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  <span>Search config...</span>
                </span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-text-muted opacity-100 dark:bg-slate-900 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
            {/* Right Nav Links */}
            <nav className="flex items-center gap-4 pl-4">
              <Link className="text-sm font-medium text-text-muted hover:text-primary transition-colors hidden lg:block" to="/docs/backend-architecture">API Reference</Link>
              {/* ... */}
             <Link to="http://localhost:3000/login" className="ml-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover transition-colors no-underline hover:text-white">
                  Login
                </Link>

            </nav>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex items-start">
        {/* Left Sidebar (Navigation) */}
        <aside className={`fixed top-16 z-30 -ml-2 h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block md:w-72 overflow-y-auto border-r border-border-light dark:border-border-dark py-6 pr-4 pl-4 lg:pl-8 bg-background-light dark:bg-background-dark transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-2' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-col gap-6">
            {/* Group 1 */}
            <div className="flex flex-col gap-2">
              <h4 className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-text-main dark:text-white">Getting Started</h4>
              <Link className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:no-underline" to="/docs/buyers-guide">
                <span>Introduction</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
               {/* ... */}
               <Link className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/installation#quickstart">
                <span>Quickstart Guide</span>
              </Link>
            </div>
            {/* Group 2 */}
            <div className="flex flex-col gap-2">
              <h4 className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-text-main dark:text-white">Core Pillars</h4>
              <div className="flex flex-col gap-1">
                <button 
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main cursor-pointer border-none bg-transparent"
                    onClick={() => setAiMenuOpen(!aiMenuOpen)}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    AI Intelligence
                  </span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${aiMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {/* Sub-items */}
                {aiMenuOpen && (
                    <div className="ml-4 flex flex-col border-l border-border-light pl-2 dark:border-border-dark">
                    <Link className="flex items-center rounded-md px-2 py-1.5 text-sm text-text-muted hover:text-text-main hover:no-underline" to="/docs/buyers-guide#2-ai-native-architecture">Generative Insights</Link>
                    <Link className="flex items-center rounded-md px-2 py-1.5 text-sm text-text-muted hover:text-text-main hover:no-underline" to="/docs/buyers-guide#core-features">Model Training</Link>
                    </div>
                )}
              </div>
              <Link className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/backend-architecture">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">domain</span>
                  B2B Infrastructure
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <Link className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/billing">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  Payment & Billing
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
              <Link className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/backend-architecture">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  Ops Reliability
                </span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
            {/* Group 3 */}
            <div className="flex flex-col gap-2">
              <h4 className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-text-main dark:text-white">Resources</h4>
              <Link className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/backend-architecture">
                <span>API Reference</span>
                <span className="material-symbols-outlined text-[16px] opacity-50">open_in_new</span>
              </Link>
              <Link className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="#">
                <span>Changelog</span>
              </Link>
              <Link className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-text-muted hover:bg-background-subtle hover:text-text-main hover:no-underline" to="/docs/buyers-guide#frequently-asked-questions">
                <span>FAQs</span>
              </Link>
            </div>
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

          {/* Feedback */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-xl bg-background-subtle p-8 text-center dark:bg-slate-900/50">
            <h3 className="font-medium text-text-main dark:text-white">Was this page helpful?</h3>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 rounded-md border border-border-light bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-border-dark dark:bg-slate-800 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                Yes
              </button>
              <button className="flex items-center gap-2 rounded-md border border-border-light bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-border-dark dark:bg-slate-800 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-lg">thumb_down</span>
                No
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar (Table of Contents) */}
        <aside className="hidden xl:sticky xl:top-16 xl:block xl:h-[calc(100vh-4rem)] xl:w-72 xl:flex-none xl:overflow-y-auto xl:py-8 xl:pr-8">
          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-text-main dark:text-white">On this page</h5>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link className="text-primary font-medium hover:underline block py-1 border-l-2 border-primary pl-3 -ml-[14px]" to="#">Introduction</Link>
              </li>
              <li>
                <Link className="text-text-muted hover:text-text-main block py-1 pl-3 hover:border-l-2 hover:border-border-light -ml-[14px] transition-all" to="#">Core Modules</Link>
              </li>
              <li>
                <Link className="text-text-muted hover:text-text-main block py-1 pl-3 hover:border-l-2 hover:border-border-light -ml-[14px] transition-all" to="#">System Architecture</Link>
              </li>
              <li>
                <Link className="text-text-muted hover:text-text-main block py-1 pl-3 hover:border-l-2 hover:border-border-light -ml-[14px] transition-all" to="#">Integration Example</Link>
              </li>
            </ul>
             <div className="mt-8 border-t border-border-light pt-6 dark:border-border-dark">
                <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-main dark:text-white">Community</h5>
                <Link className="flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-3" to="#">
                    <span className="material-symbols-outlined text-lg">forum</span>
                    Join Discord
                </Link>
                <Link className="flex items-center gap-2 text-sm text-text-muted hover:text-primary" to="#">
                    <span className="material-symbols-outlined text-lg">school</span>
                    Video Tutorials
                </Link>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}
