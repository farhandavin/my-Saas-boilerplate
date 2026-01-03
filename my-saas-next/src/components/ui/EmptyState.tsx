import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  image?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  image,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50',
        className
      )}
    >
      <div className="flex flex-col items-center max-w-md mx-auto">
        {image ? (
          <div className="relative w-40 h-40 mb-6">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain opacity-80"
            />
          </div>
        ) : icon ? (
          <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-slate-100 dark:bg-slate-800">
            {icon}
          </div>
        ) : null}
        
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          {description}
        </p>

        {action && (
          <div className="flex items-center gap-3">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
