'use client';
import { PrivacyToggle } from "@/components/ui/PrivacyToggle";

export function Header({ title = "Executive Overview" }: { title?: string }) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] px-6 py-3 flex-none">
      <div className="flex items-center gap-4 lg:gap-8">
        <button className="md:hidden text-slate-500 dark:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <h2 className="text-lg font-bold leading-tight tracking-tight">{title}</h2>
        </div>
        
        {/* Search Bar */}
        <div className="hidden sm:flex flex-col min-w-40 h-10 w-64 lg:w-96">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-[#232f48] border border-transparent focus-within:border-[#135bec]/50 transition-colors">
            <div className="text-slate-400 dark:text-[#92a4c9] flex items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 bg-transparent border-none h-full placeholder:text-slate-400 dark:placeholder:text-[#92a4c9] px-3 text-sm font-normal focus:ring-0" 
              placeholder="Search data, reports, or tasks..."
            />
          </div>
        </div>
      </div>

      {/* Right side - User Controls */}
      <div className="flex items-center gap-4 lg:gap-6">
        <PrivacyToggle />
        {/* Placeholder for notification/profile if needed later */}
      </div>
    </header>
  );
}
