import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// 🛡️ ESM FIX: Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars (useful if you need to access VITE_ vars inside config)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // ⚡ SERVER OPTIMIZATIONS
    server: {
      port: 5173,
      strictPort: false, // Fallback if 5173 is taken
      host: true,        // ✅ Allows access from local network (mobile testing)
      cors: true,        // ✅ Fixes rare CORS issues during dev
    },

    // 🏗️ BUILD "MASTER" OPTIMIZATIONS
    build: {
      target: 'esnext',  // ✅ Modern browsers = smaller, faster bundles
      outDir: 'dist',
      sourcemap: mode !== 'production', // ✅ No source maps in prod (security/size)
      minify: 'esbuild', // Fast minification
      
      // 🧹 CLEANUP: Remove console.logs in production automatically
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },

      rollupOptions: {
        output: {
          // 🧠 INTELLIGENT CHUNKING STRATEGY
          // Separates core engines (React) from Data (Supabase) from UI (Lucide)
          manualChunks: (id) => {
            // 1. React Core (Changes rarely)
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router-dom')) {
              return 'react-engine';
            }
            // 2. Database Client (Critical for Data Backing)
            if (id.includes('@supabase')) {
              return 'database-connector';
            }
            // 3. UI Library (Lucide/Tailwind utils)
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-components';
            }
            // 4. Everything else
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000, 
      cssCodeSplit: true,
    },

    // 🚀 SPEED: Pre-bundle these dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'lucide-react'],
    },
  };
});
