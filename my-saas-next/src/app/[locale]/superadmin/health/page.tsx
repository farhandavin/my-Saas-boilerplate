
import { PlatformService } from '@/services/platformService';

export const dynamic = 'force-dynamic';

export default async function SystemHealthPage() {
  const healthData = await PlatformService.getSystemHealth();

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-800">System Health</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
             <p className="text-green-100 text-sm font-medium">Global Status</p>
             <h3 className="text-3xl font-bold mt-1">Operational</h3>
             <p className="text-xs text-green-200 mt-4">Uptime: 99.99% (Last 30 days)</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
             <p className="text-gray-500 text-sm font-medium">Average Latency</p>
             <h3 className="text-3xl font-bold text-gray-900 mt-1">45ms</h3>
             <p className="text-xs text-green-600 mt-4">↓ 5ms improvement</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
             <p className="text-gray-500 text-sm font-medium">Error Rate</p>
             <h3 className="text-3xl font-bold text-gray-900 mt-1">0.01%</h3>
             <p className="text-xs text-gray-400 mt-4">Within SLA limits</p>
          </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                   <th className="px-6 py-4">Service</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Latency</th>
                   <th className="px-6 py-4">Last Checked</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
                {healthData.map((service, idx) => (
                   <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{service.service}</td>
                      <td className="px-6 py-4">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {service.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono">{service.latency}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">Just now</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}
