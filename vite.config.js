import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: './', 
  server: {
    port: 3000,
    strictPort: true, 
  },
  // TACTICAL: Production Hardening
  esbuild: {
    // Only strip logs in production, keep them for dev
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react', '@supabase/supabase-js'],
        },
      },
    },
  }
}))
