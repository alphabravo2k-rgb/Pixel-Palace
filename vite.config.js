import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', 
  server: {
    port: 3000,
    strictPort: true, 
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // TACTICAL: Optimization
    cssCodeSplit: true, // Extracts CSS for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react', '@supabase/supabase-js'],
        },
      },
    },
  }
})
