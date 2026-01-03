'use client';

import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';


type AgentStatus = 'IDLE' | 'THINKING' | 'ACTING' | 'AWAITING_APPROVAL';

interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  progress: number;
  message: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AgentActivity() {
  const { data, error } = useSWR<{ agents: Agent[] }>('/api/agents/status', fetcher, {
    refreshInterval: 3000,
  });

  if (!data) return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground dark:text-white uppercase tracking-wider">Active Agents</h3>
      <div className="space-y-3">
         {[1, 2].map(i => (
           <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
         ))}
      </div>
    </div>
  );
  
  if (error) return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground dark:text-white uppercase tracking-wider">Active Agents</h3>
      <ErrorDisplay message="Failed to connect to Agent Network" compact />
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground dark:text-white uppercase tracking-wider">
        Active Agents
      </h3>
      <div className="grid gap-4">
        <AnimatePresence>
          {data.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const isThinking = agent.status === 'THINKING';
  const isActing = agent.status === 'ACTING';
  const isWaiting = agent.status === 'AWAITING_APPROVAL';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative overflow-hidden bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-4 shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-foreground dark:text-white">{agent.name}</h4>
          <p className="text-xs text-text-sub dark:text-slate-400 mt-0.5">{agent.message}</p>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Progress Bar */}
      {(isThinking || isActing) && (
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${agent.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Approval Action */}
      {isWaiting && (
        <div className="mt-3 flex gap-2">
           <button className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors">
             Approve
           </button>
           <button className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors">
             Reject
           </button>
        </div>
      )}

      {/* Streaming Effect Overlay */}
      {isThinking && (
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const styles: Record<AgentStatus, string> = {
    IDLE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    THINKING: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    ACTING: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    AWAITING_APPROVAL: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
