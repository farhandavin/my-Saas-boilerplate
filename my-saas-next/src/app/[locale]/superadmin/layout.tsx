
import React from 'react';
import Link from 'next/link';

export default async function SuperAdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const links = [
    { href: `/${locale}/superadmin`, label: 'Operational Intelligence', icon: '📊' },
    { href: `/${locale}/superadmin/tenants`, label: 'Tenant Manager', icon: '🏢' },
    { href: `/${locale}/superadmin/schema-sync`, label: 'Schema Sync', icon: '🔄' },
    { href: `/${locale}/superadmin/health`, label: 'System Health', icon: '❤️' },
    { href: `/${locale}/dashboard`, label: 'Back to App', icon: '↩️' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Superadmin
          </h1>
          <p className="text-xs text-slate-400">Platform Control Center</p>
        </div>

        <nav className="space-y-2 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="text-xs text-slate-500 mt-auto">
          v1.0.0 Stable
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
