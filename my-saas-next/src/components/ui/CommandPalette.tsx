'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  User, 
  Moon, 
  Sun,
  ShieldCheck,
  Bot,
  FileText,
  Search
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Toggle with Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm animate-in fade-in-0 px-4">
       <div className="w-full max-w-lg bg-white dark:bg-[#111722] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-black/5">
        <Command className="w-full">
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-500" />
            <Command.Input 
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Quick Creation" className="text-xs text-slate-500 font-medium mb-2 px-2 select-none">
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/invoices/new'))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>New Invoice</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/setting/team'))}>
                <User className="mr-2 h-4 w-4" />
                <span>Invite Member</span>
              </CommandItem>
            </Command.Group>

            <Command.Group heading="Navigation" className="text-xs text-slate-500 font-medium mb-2 px-2 select-none">
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/ai'))}>
                <Bot className="mr-2 h-4 w-4" />
                <span>AI Assistant</span>
              </CommandItem>
               <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/invoices'))}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Invoices</span>
              </CommandItem>
               <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/subscription'))}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Subscription</span>
              </CommandItem>
            </Command.Group>

            <Command.Group heading="Settings" className="text-xs text-slate-500 font-medium mb-2 px-2 select-none mt-2">
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/setting/profile'))}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/setting/general'))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/privacy-layer'))}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Privacy Layer</span>
              </CommandItem>
            </Command.Group>

            <Command.Group heading="Actions" className="text-xs text-slate-500 font-medium mb-2 px-2 select-none mt-2">
              <CommandItem onSelect={() => runCommand(() => toggleTheme())}>
                <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Toggle Theme</span>
              </CommandItem>
            </Command.Group>

          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect?: () => void }) {
  return (
    <Command.Item 
      onSelect={onSelect}
      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 text-slate-900 dark:text-slate-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {children}
    </Command.Item>
  );
}
