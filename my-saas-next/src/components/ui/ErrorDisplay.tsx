
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorDisplay({ 
  title = "Something went wrong", 
  message = "We couldn't load this data.", 
  onRetry,
  className,
  compact = false
}: ErrorDisplayProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10",
      compact && "p-3 border-none bg-transparent",
      className
    )}>
      <div className={cn(
        "p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-3",
        compact && "p-1 mb-2"
      )}>
        <AlertTriangle className={cn("w-6 h-6", compact && "w-4 h-4")} />
      </div>
      
      {!compact && <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">{title}</h3>}
      <p className={cn("text-xs text-red-600 dark:text-red-400 max-w-[250px]", compact && "text-[10px]")}>
        {message}
      </p>

      {onRetry && (
        <button 
          onClick={onRetry}
          className={cn(
            "mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm",
            compact && "mt-2 px-2 py-1"
          )}
        >
          <RefreshCcw className="w-3 h-3" />
          Try Again
        </button>
      )}
    </div>
  );
}
