import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';

// Konfigurasi Cache: Data dianggap "fresh" selama 1 menit. 
// Ini mengurangi request ke server drastis (Performance Boost).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, 
      refetchOnWindowFocus: false, // UX: Jangan refresh saat pindah tab (opsional)
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);