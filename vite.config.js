import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // ⚠️ CRITICAL FIX: Changed './' to '/' 
  // This ensures assets load correctly from /admin/login
  base: '/', 
  
  server: {
    port: 3000,
    strictPort: true, 
  },
  esbuild: {
    drop: mode === 'production' ? ['debugger'] : [],
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
