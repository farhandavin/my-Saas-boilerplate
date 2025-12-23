import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tambahkan bagian ini untuk mencegah "Duplicate React"
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})