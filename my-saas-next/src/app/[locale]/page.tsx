'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#f6f6f8] dark:bg-[#101622] text-slate-900 dark:text-white antialiased overflow-x-hidden font-display">
      {/* Navbar */}
      <div className="sticky top-0 z-50 w-full border-b border-solid border-b-[#232f48] bg-[#111722]/80 backdrop-blur-md">
        <div className="flex items-center justify-between whitespace-nowrap px-4 py-3 md:px-10 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3 text-white">
            <div className="size-8 flex items-center justify-center rounded bg-[#135bec] text-white">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>layers</span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Enterprise OS</h2>
          </div>
          <div className="hidden md:flex flex-1 justify-center gap-8">
            <nav className="flex items-center gap-6 lg:gap-9">
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors" href="#ai">AI Core</a>
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors" href="#infrastructure">Infrastructure</a>
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors" href="#payments">Payments</a>
              <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors" href="#operations">Operations</a>
            </nav>
          </div>
          <div className="flex gap-2">
            <Link href="/auth">
                <button className="hidden sm:flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-4 bg-transparent border border-gray-600 hover:border-gray-400 text-white text-sm font-bold transition-all">
                <span className="truncate">Log In</span>
                </button>
            </Link>
            <Link href="/auth">
                <button className="flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-4 bg-[#135bec] hover:bg-[#135bec]/90 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(19,91,236,0.3)]">
                <span className="truncate">Request Demo</span>
                </button>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full relative px-4 py-16 md:py-24 max-w-[1280px] mx-auto overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#135bec]/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-6 lg:w-1/2 lg:pr-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#135bec]/30 bg-[#135bec]/10 px-3 py-1 w-fit">
                <span className="flex h-2 w-2 rounded-full bg-[#135bec] animate-pulse"></span>
                <span className="text-xs font-medium text-[#135bec] uppercase tracking-wide">v2.4 is live</span>
              </div>
              <h1 className="text-white text-5xl font-black leading-[1.1] tracking-[-0.033em] md:text-6xl lg:text-7xl">
                The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Modern Enterprise</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl font-normal leading-relaxed max-w-[600px]">
                Unified AI, Payments, and Operations infrastructure. Built for scale with Next.js and Gemini to power your business logic.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                 <Link href="/auth">
                    <button className="flex h-12 cursor-pointer items-center justify-center rounded-lg px-6 bg-[#135bec] hover:bg-blue-600 text-white text-base font-bold transition-all shadow-lg hover:shadow-[#135bec]/25">
                    Start Free Trial
                    </button>
                </Link>
                <Link href="https://my-saas-boilerplate-6pgd.vercel.app/" target="_blank">
                  <button className="flex h-12 cursor-pointer items-center justify-center rounded-lg px-6 bg-[#192233] border border-[#232f48] hover:border-gray-500 text-white text-base font-bold transition-all">
                    View Documentation
                  </button>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  <span>SOC2 Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                  <span>99.99% Uptime</span>
                </div>
              </div>
            </div>

            <div className="relative w-full lg:w-1/2 mt-10 lg:mt-0">
              <div className="relative rounded-xl border border-[#232f48] bg-[#0b0f17] shadow-2xl overflow-hidden group">
                {/* Header of IDE */}
                <div className="flex items-center justify-between border-b border-[#232f48] bg-[#1e293b]/50 px-4 py-3">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="text-xs font-mono text-gray-400">api/v1/enterprise-logic.ts</div>
                  <div></div>
                </div>
                {/* Code Content */}
                <div className="p-6 font-mono text-sm overflow-x-auto custom-scrollbar bg-[#0f1115]">
                  <div className="text-blue-400 inline-block mr-2">import</div> 
                  <span className="text-white">{'{ '}</span> 
                  <span className="text-yellow-300">EnterpriseClient</span> 
                  <span className="text-white">{' }'}</span> 
                  <div className="text-blue-400 inline-block mx-2">from</div> 
                  <span className="text-green-400">'@enterprise-os/sdk'</span>;
                  <br /><br />
                  <div className="text-purple-400 inline-block mr-2">const</div> 
                  <span className="text-white">client</span> 
                  <span className="text-blue-400 mx-2">=</span> 
                  <div className="text-purple-400 inline-block mr-2">new</div> 
                  <span className="text-yellow-300">EnterpriseClient</span>
                  <span className="text-white">{'({'}</span>
                  <br />&nbsp;&nbsp;<span className="text-blue-300">apiKey:</span> <span className="text-green-400">process.env.EOS_API_KEY</span>,
                  <br />&nbsp;&nbsp;<span className="text-blue-300">region:</span> <span className="text-green-400">'us-east-1'</span>,
                  <br />&nbsp;&nbsp;<span className="text-blue-300">modules:</span> <span className="text-white">['</span><span className="text-green-400">ai</span><span className="text-white">', '</span><span className="text-green-400">payments</span><span className="text-white">', '</span><span className="text-green-400">ops</span><span className="text-white">']</span>
                  <br /><span className="text-white">{'}'});</span>
                  <br /><br />
                  <span className="text-gray-500">// Initialize AI-driven workflow</span>
                  <br /><div className="text-purple-400 inline-block mr-2">await</div> 
                  <span className="text-white">client.workflows.create({'{'}</span>
                  <br />&nbsp;&nbsp;<span className="text-blue-300">name:</span> <span className="text-green-400">'Q4 Revenue Forecast'</span>,
                  <br />&nbsp;&nbsp;<span className="text-blue-300">model:</span> <span className="text-green-400">'gemini-pro-vision'</span>,
                  <br />&nbsp;&nbsp;<span className="text-blue-300">trigger:</span> <span className="text-green-400">'monthly_close'</span>
                  <br /><span className="text-white">{'});'}</span>
                </div>
                {/* Floating Badge */}
                <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border border-[#232f48] bg-[#1e293b] p-3 shadow-lg animate-bounce duration-[3000ms]">
                  <span className="material-symbols-outlined text-green-400">bolt</span>
                  <div className="text-xs font-medium text-white">Connected <span className="text-gray-400">12ms</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="w-full border-y border-[#232f48] bg-[#0b0e14]">
          <div className="max-w-[1280px] mx-auto py-10 px-4">
            <p className="text-[#92a4c9] text-xs font-semibold tracking-widest text-center uppercase mb-8">Trusted by forward-thinking enterprises</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-white font-bold text-xl"><span className="material-symbols-outlined">change_history</span> ACME Corp</div>
              <div className="flex items-center gap-2 text-white font-bold text-xl"><span className="material-symbols-outlined">diamond</span> Gemstone</div>
              <div className="flex items-center gap-2 text-white font-bold text-xl"><span className="material-symbols-outlined">all_inclusive</span> InfiniteLoop</div>
              <div className="flex items-center gap-2 text-white font-bold text-xl"><span className="material-symbols-outlined">rocket_launch</span> StarSystem</div>
              <div className="flex items-center gap-2 text-white font-bold text-xl"><span className="material-symbols-outlined">api</span> DataFlow</div>
            </div>
          </div>
        </section>

        {/* Features Grid (Bento Box) */}
        <section className="w-full py-20 px-4 max-w-[1280px] mx-auto" id="infrastructure">
          <div className="flex flex-col gap-4 mb-16 text-center max-w-[720px] mx-auto">
            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">
              Four Pillars of Infrastructure
            </h2>
            <p className="text-gray-400 text-lg">A modular architecture designed to power the next generation of business applications, from startup to IPO.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            {/* Large Card: AI Core */}
            <div className="group relative md:col-span-2 rounded-xl border border-[#232f48] bg-[#192233] overflow-hidden hover:border-[#135bec]/50 transition-colors" id="ai">
              <div className="absolute inset-0 bg-gradient-to-br from-[#135bec]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <div className="w-full h-48 rounded-lg mb-6 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIKmMRRUI1tFXSzhztV018iqhJ7ON3ko20vccYBo0O57P4db39eVZxAgnRJqk14Caw-tTqlDl2efr42jivzBcee-688HibvoZCCchSZd2p_TedQlcKHoyKRdc1e_JqFmC-mTCI6qg4GDJ2bIcEbw-cTNhl82vvcR4AHbY276J1MVnl5sdjDp9A3urqSqFi4gvyXrWGoI4v7VV-9fBneJ2uhWHCm4Ehq2p-NH8q8wYQoWYZSXy9iN1oTctZ_fiYhL4dfGJD3xikPso')" }}></div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#135bec]/20 p-2 rounded-lg text-[#135bec]">
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <h3 className="text-white text-xl font-bold">AI-Native Intelligence</h3>
                  </div>
                  <p className="text-gray-400">Embedded predictive analytics powered by Gemini. forecast trends, automate support, and generate insights directly from your PostgreSQL database.</p>
                </div>
              </div>
            </div>

            {/* Tall Card: Payments */}
            <div className="group relative rounded-xl border border-[#232f48] bg-[#192233] overflow-hidden hover:border-[#135bec]/50 transition-colors md:row-span-2" id="payments">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
              <div className="p-8 h-full flex flex-col relative z-10">
                <div className="bg-[#135bec]/20 p-2 w-fit rounded-lg text-[#135bec] mb-4">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Global Payments</h3>
                <p className="text-gray-400 mb-8">Multi-currency support with instant reconciliation and fraud detection.</p>
                {/* Visualization of a card */}
                <div className="mt-auto relative w-full aspect-[3/4] rounded-lg bg-gradient-to-tr from-[#1e293b] to-[#334155] p-6 flex flex-col justify-between shadow-2xl border border-white/5">
                  <div className="flex justify-between items-start">
                    <span className="text-white/80 font-mono text-xs">VIRTUAL CARD</span>
                    <span className="material-symbols-outlined text-white">contactless</span>
                  </div>
                  <div className="text-white text-xl font-mono tracking-widest">
                    •••• 4242
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">Card Holder</div>
                      <div className="text-sm text-white font-medium">Enterprise User</div>
                    </div>
                    <div className="h-8 w-12 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regular Card: B2B Logic */}
            <div className="group relative rounded-xl border border-[#232f48] bg-[#192233] overflow-hidden hover:border-[#135bec]/50 transition-colors">
              <div className="p-8">
                <div className="bg-[#135bec]/20 p-2 w-fit rounded-lg text-[#135bec] mb-4">
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">B2B Core Logic</h3>
                <p className="text-gray-400">Seamless vendor management, supply chain logic, and inventory synchronization.</p>
              </div>
              <div className="px-8 pb-8 pt-0">
                <div className="w-full h-32 bg-[#0f1115] rounded border border-[#232f48] p-4 flex items-center justify-center">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-500"><span className="material-symbols-outlined text-sm">inventory_2</span></div>
                    <div className="h-0.5 w-8 bg-gray-700"></div>
                    <div className="h-10 w-10 rounded bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-500"><span className="material-symbols-outlined text-sm">local_shipping</span></div>
                    <div className="h-0.5 w-8 bg-gray-700"></div>
                    <div className="h-10 w-10 rounded bg-green-500/20 border border-green-500 flex items-center justify-center text-green-500"><span className="material-symbols-outlined text-sm">storefront</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regular Card: Operations */}
            <div className="group relative rounded-xl border border-[#232f48] bg-[#192233] overflow-hidden hover:border-[#135bec]/50 transition-colors" id="operations">
              <div className="p-8">
                <div className="bg-[#135bec]/20 p-2 w-fit rounded-lg text-[#135bec] mb-4">
                  <span className="material-symbols-outlined">settings_suggest</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Operational Reliability</h3>
                <p className="text-gray-400">Automated workflows ensuring 99.9% uptime. Built-in compliance and security controls.</p>
              </div>
              <div className="px-8 pb-8 pt-0">
                <div className="flex gap-2">
                  <div className="h-2 w-full rounded-full bg-green-500/20 overflow-hidden">
                    <div className="h-full w-[99%] bg-green-500"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
                  <span>System Status</span>
                  <span className="text-green-400">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases / Image Grid */}
        <section className="w-full py-16 px-4 bg-[#0b0e14] border-t border-[#232f48]">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="text-white text-3xl font-bold mb-2">Built for diverse industries</h2>
                <p className="text-gray-400">From logistics to fintech, Enterprise OS adapts to your scale.</p>
              </div>
              <button className="text-[#135bec] font-bold flex items-center gap-1 hover:text-white transition-colors">
                View all case studies <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group relative aspect-square overflow-hidden rounded-xl bg-gray-900">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDngM2n2yq6rqdv7CoXxknjBiwD0AOR2bqIF5ooFZn2ZnwECHs3XU4dXok6qNekUmP0eUtF0TP-jNYcltHzlrN0gnsJsc4g-nMMMT9q5J9wgNPUM8sSEvXI5sRNZTMfvxQq5FHCC5t8J5JfWEr1OgBeLo1vTUbgbticPAFWn1NAotWHkSl4r218_d5WB-xY7is_ujTizpx6SjTwymr1wfpJAKuPm-eeHkUfIRPlU1z-5RLw_td7aLlzupmNYg-I_UHtkYD92pjuWfE')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
                  <h4 className="text-white font-bold text-lg">Fintech</h4>
                  <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Real-time ledgering</p>
                </div>
              </div>
              <div className="group relative aspect-square overflow-hidden rounded-xl bg-gray-900">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRueERCowqV0PssH8aF-v7BHhYzRFTIhhxjIUaD7K6DIbULb8wHHvHN_AXHvVu9ONmpln403j4a56YOZKDRt8X0GpnLN404P_D-bwzWjL6V2lOTOyA3hwetWhMU5vfTKxfltPxPlmMFAvzK6Xm8jzmYIEwf-hWVJGw3Z6nSFgaD2cK-HeOymi542DJNGFZEHZ53cNolLhIOfzJ5wxOp5uiyaQOm7ukWtUtTa342NLepKRS3_3IU8Q6j78U4Sr5rCKLTHK5l6j5CZc')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
                  <h4 className="text-white font-bold text-lg">Logistics</h4>
                  <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Route optimization AI</p>
                </div>
              </div>
              <div className="group relative aspect-square overflow-hidden rounded-xl bg-gray-900">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8Vca6L6rmchlqg96LRiuuWePlR2JpZWAJYsxLSqJ24oc5OjXjnZJUZGApKMgh_R-Iv0v54FsJnSIS_I4Co7iDi0aPOm0o4g-k_kj4HgVO_GRk6ghhYLqsT-FL0vQG1smsodUyTt7RwFMda8vw-1AGUJbJ8onkL7cuWk_fdMXC4d1FOEOQ-7mv8rlzoUyDwEvIksoo-yx9oYMhZ6SJt4tHK8_vxNXjacxkNhYPDA4_-4jOR2z31THlZy3DGeOzlRaZjBAs8gR1PTg')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
                  <h4 className="text-white font-bold text-lg">Healthcare</h4>
                  <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">HIPAA compliant data</p>
                </div>
              </div>
              <div className="group relative aspect-square overflow-hidden rounded-xl bg-gray-900">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDUa3l0sMom2elX2PlBJfJ68Iw_EFqaAt6205FC0eIap3KMnNGgzn06CXxtk0f135nuBvJ6_enfWDiTrSpmMhw7wXVDVvPi0lPJ4aU4pQcOBrPfaiTMrpQk5MTWOpRFd2Z_ASI6QRJigSW26zuUNrUWLd8HXOeUgS4KRwMzvPHG7owHyOSo7xSTyeG6X6zKBtjSaipcS03ji2Xb5B7kchhT_5lNJPJpVIUn8OQkEzBicBD8kH7Yf_OOJmqnMxYR90pio-ZsXRa9NII')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
                  <h4 className="text-white font-bold text-lg">SaaS</h4>
                  <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Usage-based billing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 px-4">
          <div className="max-w-[960px] mx-auto rounded-2xl bg-gradient-to-r from-[#135bec] to-blue-700 p-1">
            <div className="bg-[#111722] rounded-[14px] px-6 py-16 md:px-16 text-center h-full flex flex-col items-center justify-center gap-6 relative overflow-hidden">
              {/* Decorative glow inside CTA */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#135bec]/20 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight z-10">Ready to upgrade your infrastructure?</h2>
              <p className="text-gray-300 text-lg max-w-lg z-10">Stop building from scratch. Get your API keys today and deploy your first Enterprise OS instance in minutes.</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 z-10 w-full justify-center">
                 <Link href="/auth">
                    <button className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center rounded-lg px-6 bg-white text-[#135bec] text-base font-bold hover:bg-gray-100 transition-colors">
                    Get Started
                    </button>
                </Link>
                <button className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center rounded-lg px-6 bg-transparent border border-gray-600 text-white text-base font-bold hover:bg-gray-800 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-[#232f48] bg-[#0b0e14] pt-16 pb-8 px-4">
          <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 lg:col-span-2 flex flex-col gap-4 pr-10">
              <div className="flex items-center gap-3 text-white">
                <div className="size-6 flex items-center justify-center rounded bg-[#135bec] text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span>
                </div>
                <h2 className="text-white text-base font-bold">Enterprise OS</h2>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                The complete operating system for modern business. Unified, scalable, and secure infrastructure for the next generation of enterprise.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold">Product</h4>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">AI Core</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">B2B Infrastructure</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">Payments</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">Operations</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold">Developers</h4>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">Documentation</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">API Reference</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">Status</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">GitHub</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold">Company</h4>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">About</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">Blog</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">Careers</a>
              <a className="text-gray-500 hover:text-white text-sm transition-colors" href="#">Legal</a>
            </div>
          </div>
          <div className="max-w-[1280px] mx-auto pt-8 border-t border-[#232f48] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">© 2024 Enterprise OS Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-gray-600 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
              <a className="text-gray-600 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
              <a className="text-gray-600 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">rss_feed</span></a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
