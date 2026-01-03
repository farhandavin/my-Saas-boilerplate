import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  userId: string;
  metadata?: any;
    // user relation might not be populated in the simple query, 
    // but in a real app we'd join with users table.
    // For now we'll assume the API could populate it or we just show userId.
}

interface ActivityLogProps {
  logs: AuditLog[];
}

export function ActivityLog({ logs }: ActivityLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history</span>
        <p>No activity history found.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {logs.map((log, logIdx) => {
          // Determine icon and color based on action
          let icon = 'edit';
          let colorClass = 'bg-blue-500';

          if (log.action.includes('CREATED')) {
            icon = 'add';
            colorClass = 'bg-green-500';
          } else if (log.action.includes('DELETED')) {
            icon = 'delete';
            colorClass = 'bg-red-500';
          }

          const hasDiff = log.metadata?.changes;

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== logs.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-900 ${colorClass}`}>
                      <span className="material-symbols-outlined text-white text-sm">{icon}</span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-200">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-gray-500 dark:text-gray-400"> • {log.details}</span>
                      </p>
                      
                      {/* Diff View */}
                      {hasDiff && (
                        <div className="mt-2 bg-gray-50 dark:bg-slate-800 rounded-md p-2 text-xs font-mono border border-gray-100 dark:border-slate-700">
                           {Object.keys(log.metadata.changes).map(key => (
                             <div key={key} className="flex gap-2">
                               <span className="font-bold text-gray-600 dark:text-gray-400">{key}:</span>
                               <span className="text-red-500 line-through opacity-70">{log.metadata.changes[key].from}</span>
                               <span className="text-gray-400">→</span>
                               <span className="text-green-600">{log.metadata.changes[key].to}</span>
                             </div>
                           ))}
                        </div>
                      )}

                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
