
import { PlatformService } from '@/services/platformService';

export const dynamic = 'force-dynamic';

export default async function TenantManagerPage() {
  const tenants = await PlatformService.getAllTenants();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tenant Manager</h2>
           <p className="text-sm text-gray-500">Manage {tenants.length} active organizations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Add Tenant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Tenant Name</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Infrastructure</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tenants.map((team: any) => (
              <tr key={team.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{team.name}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{team.slug}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    team.dedicatedDatabaseUrl 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {team.dedicatedDatabaseUrl ? 'ISOLATED DB' : 'SHARED DB'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(team.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex w-2 h-2 rounded-full bg-green-500 mr-2" />
                   Active
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
