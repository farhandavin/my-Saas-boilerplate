import { useEffect, useState } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Cek localStorage saat pertama kali dimuat
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Reset class
    root.classList.remove('light', 'dark');
    
    // Tambahkan class tema yang aktif
    root.classList.add(theme);

    // Simpan preferensi ke localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}