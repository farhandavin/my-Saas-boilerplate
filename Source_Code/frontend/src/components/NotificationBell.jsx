import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifs(res.data.data);
      setUnread(res.data.unreadCount);
    } catch (err) {
      console.error("Failed fetch notifications");
    }
  };

  // Polling setiap 30 detik untuk cek notifikasi baru
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRead = async (id, type) => {
    // Optimistic UI update
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    
    await api.patch(`/notifications/${id}/read`);

    // Jika notifikasi tipe UPSELL, arahkan ke halaman Pricing saat diklik
    if (type === 'UPSELL') {
      navigate('/pricing');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700">Notifikasi</h3>
            <button onClick={fetchNotifs} className="text-xs text-indigo-600 hover:underline">Refresh</button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">Belum ada notifikasi</div>
            ) : (
              notifs.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleRead(n.id, n.type)}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'UPSELL' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className={`text-sm font-medium ${n.type === 'UPSELL' ? 'text-red-600' : 'text-gray-800'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
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