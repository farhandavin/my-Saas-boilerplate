'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState } from './ui/EmptyState';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifs = async () => {
    try {
      // const token = localStorage.getItem('token');
      // if (!token) return;
      
      const res = await fetch('/api/notifications', {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setNotifs(json.data || []);
        setUnread(json.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id: string, type: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    
    try {
      // const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        // headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {}

    if (type === 'UPSELL') {
      router.push('/pricing');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-800">
            {unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden">
          <div className="p-3 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 dark:text-white">Notifikasi</h3>
            <button onClick={fetchNotifs} className="text-xs text-indigo-600 hover:underline">Refresh</button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-4">
                <EmptyState 
                  title="All caught up"
                  description="You have no new notifications at this time."
                  icon={<span className="material-symbols-outlined text-2xl text-slate-300">notifications_off</span>}
                  className="bg-transparent border-none p-2"
                />
              </div>
            ) : (
              notifs.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleRead(n.id, n.type)}
                  className={`p-3 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'UPSELL' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className={`text-sm font-medium ${n.type === 'UPSELL' ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;