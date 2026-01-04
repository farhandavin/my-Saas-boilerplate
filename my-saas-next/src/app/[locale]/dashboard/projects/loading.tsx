
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function ProjectsLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
           <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>

       <div className="flex items-center gap-4 mb-6">
         <div className="h-10 flex-1 max-w-md bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
         <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
