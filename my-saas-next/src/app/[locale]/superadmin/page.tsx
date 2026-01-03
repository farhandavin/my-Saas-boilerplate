
import { PlatformService } from '@/services/platformService';

export const dynamic = 'force-dynamic'; // Ensure real-time stats

export default async function SuperAdminPage() {
  const stats = await PlatformService.getGlobalStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Operational Intelligence</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
          Live System Status
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          trend="+12% vs last month"
          color="bg-blue-500"
        />
        <StatCard 
          title="AI Tokens Consumed" 
          value={stats.totalAiTokens.toLocaleString()} 
          trend="High Volatility"
          color="bg-purple-500"
        />
        <StatCard 
          title="Active Tenants" 
          value={stats.totalTeams.toLocaleString()} 
          trend="+3 new today"
          color="bg-indigo-500"
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          trend="Steady Growth"
          color="bg-emerald-500"
        />
      </div>

      {/* Placeholder for Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
        [Revenue vs Token Cost Chart Visualization Would Go Here]
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`w-8 h-8 rounded-lg ${color} opacity-20`} />
      </div>
      <p className="text-xs font-medium text-green-600">{trend}</p>
    </div>
  )
}
