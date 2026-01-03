
import { PlatformService } from '@/services/platformService';

export default function SchemaSyncPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-gray-200 pb-4">
         <h2 className="text-2xl font-bold text-gray-800">Schema Synchronization</h2>
         <p className="text-sm text-gray-500 mt-1">Deploy database changes across all {`{Isolated}`} tenants safely.</p>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Production Warning</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>Migrating schemas can verify downtime. Ensure you have tested the migration SQL in staging first.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-semibold text-gray-900 mb-4">Pending Migration</h3>
           <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 mb-4">
              -- 20241230_add_superadmin.sql<br/>
              ALTER TABLE users ADD COLUMN is_super_admin boolean DEFAULT false;
           </div>
           <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
             Deploy to All Tenants
           </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-semibold text-gray-900 mb-4">Sync History</h3>
           <ul className="space-y-4">
             {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                   <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
                      <div>
                        <p className="font-medium text-gray-900">v1.2.{i} Migration</p>
                        <p className="text-gray-500 text-xs">Completed 2 days ago</p>
                      </div>
                   </div>
                   <span className="text-gray-400 font-mono text-xs">#job_{100 + i}</span>
                </li>
             ))}
           </ul>
        </div>
      </div>
    </div>
  );
}
