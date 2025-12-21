/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // 1. TYPOGRAPHY KUSTOM
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'], // Override default sans
      },
      // 2. PALET WARNA KUSTOM (Brand Identity)
      // Ini membuat aplikasi Anda tidak terlihat "Default Tailwind"
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Warna Utama (Indigo-ish)
          600: '#4f46e5', // Hover State
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Dark mode background yang lebih "Rich" daripada sekadar hitam
        slate: {
          850: '#151f32', 
          900: '#0f172a',
          950: '#020617', 
        }
      },
      // 3. BORDER RADIUS (Lebih bulat = Lebih modern di 2025)
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      // 4. ANIMASI HALUS (Micro-interactions)
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};