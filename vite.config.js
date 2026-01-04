import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// 🛡️ ESM FIX: Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars so we can use them in config if needed
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    // 📍 ALIASES: Makes imports cleaner (e.g. import Button from '@/components/Button')
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // ⚡ SERVER: Optimized for local network testing (Mobile debugging)
    server: {
      port: 5173,
      strictPort: false, // Automatically tries 5174 if 5173 is busy
      host: true,        // Exposes IP for phone testing
      cors: true,        // Prevents API blocking during dev
    },

    // 🏗️ BUILD: The "Master" Production Setup
    build: {
      // 'es2020' is the sweet spot: Fast like 'esnext', but doesn't crash iPhone 12s
      target: 'es2020', 
      outDir: 'dist',
      sourcemap: mode !== 'production', // Disable in Prod for security & speed
      minify: 'esbuild', // 20x faster than Terser
      
      // 🧹 CLEANUP: Automatically strip console.logs in production
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },

      // 🧠 INTELLIGENT CHUNKING: The "Waterfall Prevention" Strategy
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // 1. Core Engine (React) - Loads First
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router-dom')) {
              return 'react-engine';
            }
            
            // 2. Data Layer (Supabase) - Loads Second (Critical)
            if (id.includes('@supabase')) {
              return 'database-connector';
            }

            // 3. Heavy UI & Animations - Loads Last (Lazy)
            if (id.includes('framer-motion')) {
              return 'animation-engine';
            }
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui-utils';
            }

            // 4. Vendor (Everything else)
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000, 
      cssCodeSplit: true, // Optimizes CSS loading
    },

    // 🛡️ COMPATIBILITY: Polyfill 'process' for older libs to prevent crashes
    define: {
      'process.env': {},
    },

    // 🚀 SPEED: Pre-warm these packages in Dev mode
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'lucide-react', 'framer-motion'],
    },
  };
});
