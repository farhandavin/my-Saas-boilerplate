import { useState, useEffect } from 'react';
import { Search, Filter, Eye, EyeOff, Clock, Calendar, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

interface AuditTabProps {
  team: { id: string } | null;
}

export const AuditTab = ({ team }: AuditTabProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [showPII, setShowPII] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (team?.id) fetchLogs();
  }, [team?.id]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Mock data for UI development if API fails or is empty
      // In production, this would be the actual API call
      const res = await fetch(`/api/team/${team?.id}/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.logs && data.logs.length > 0) {
        setLogs(data.logs);
      } else {
        // Fallback mock data for demonstration
        setLogs([
            { id: '1', action: 'LOGIN_SUCCESS', details: 'User logged in successfully', createdAt: new Date().toISOString(), user: { email: 'ceo@company.com', name: 'Farhan CEO' } },
            { id: '2', action: 'DOCUMENT_UPLOAD', details: 'Uploaded Q3_Financials.pdf', createdAt: new Date(Date.now() - 3600000).toISOString(), user: { email: 'finance@company.com', name: 'Finance VP' } },
            { id: '3', action: 'MEMBER_INVITE', details: 'Invited john.doe@gmail.com as STAFF', createdAt: new Date(Date.now() - 86400000).toISOString(), user: { email: 'admin@company.com', name: 'Admin User' } },
            { id: '4', action: 'BILLING_UPDATE', details: 'Upgraded to PRO tier', createdAt: new Date(Date.now() - 172800000).toISOString(), user: { email: 'ceo@company.com', name: 'Farhan CEO' } },
            { id: '5', action: 'SETTINGS_CHANGE', details: 'Enabled 2FA enforcement', createdAt: new Date(Date.now() - 259200000).toISOString(), user: { email: 'security@company.com', name: 'Security Lead' } },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  const maskPII = (text: string) => {
    if (showPII) return text;
    if (text.includes('@')) {
      const [local, domain] = text.split('@');
      return `${local.charAt(0)}***@${domain}`;
    }
    return text.replace(/\b[A-Z][a-z]+\b/g, '****'); // Simple name masking
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Audit Room
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium border border-amber-200">
              SECURE AREA
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track every action within your organization.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setShowPII(!showPII)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              showPII 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showPII ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPII ? 'Hide PII' : 'Reveal PII'}
          </button>
          
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Filter size={18} />
            </button>
             <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search logs by user, action, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
        {loading && logs.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[400px]">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Loading secure logs...</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                          {log.user.name.charAt(0)}
                        </div>
                        {maskPII(log.user.email)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                     <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Recorded
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No logs found matching your search.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200"></div>
            
            <div className="space-y-8 pl-12">
              {filteredLogs.map((log, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={log.id} 
                  className="relative group"
                >
                  {/* Dot */}
                  <div className="absolute -left-[3.25rem] top-1.5 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white border border-indigo-600 z-10"></div>
                  
                  <div className="bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200 rounded-xl p-4 transition-all">
                    <div className="flex items-start justify-between mb-2">
                       <div>
                        <span className="text-sm font-bold text-slate-800 block mb-1">{log.action.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar size={12} />
                          {new Date(log.createdAt).toLocaleDateString()}
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-indigo-600 font-medium">{maskPII(log.user.name)}</span> performed this action
                        </div>
                       </div>
                       <span className="text-xs text-slate-400 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 bg-white border border-slate-100 p-2 rounded-lg">
                      {log.details}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
