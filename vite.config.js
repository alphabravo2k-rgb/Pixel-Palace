import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * 🏆 PIXEL PALACE: GLOBAL STANDARD CONFIGURATION
 * ---------------------------------------------
 * STATUS: MASTERED (VERSION 1.0 FINAL)
 * ARCHITECT: GEMINI & FOUNDER
 * * CORE PILLARS:
 * 1. INTEGRITY: Prevents startup if critical keys are missing.
 * 2. ISOLATION: Physically separates Backend (Deno) from Frontend (React).
 * 3. SPEED: Brotli compression + Smart Chunking + PWA Caching.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // 1. LOAD & INSPECT ENVIRONMENT
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  // 🛡️ INTEGRITY CHECK: Do not fly without fuel
  // If these are missing, the console will scream at you immediately.
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ CRITICAL WARNING: Supabase Environment Variables are missing!');
  }

  return {
    // 2. ENTRY POINT PRECISION
    // We explicitly tell Vite where the heart of the app beats.
    root: '.', 
    
    plugins: [
      react(),
      
      // 📱 PWA: The Native App Experience
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'pixel-palace-media-v1',
                expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] }
              }
            }
          ]
        },
        manifest: {
          name: 'Pixel Palace',
          short_name: 'PixelPalace',
          description: 'Global Standard Competitive Platform',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        }
      }),

      // ⚡ BROTLI COMPRESSION (Only builds in Production)
      isProd && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),

      // 📊 BUNDLE ANALYTICS (Generates dist/stats.html)
      visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true, open: false })
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // 🖥️ SERVER CONFIGURATION
    server: {
      port: 5173,
      host: true, // Expose to network (accessible via phone)
      strictPort: true, // If 5173 is taken, fail (Predictability > Convenience)
      cors: true,
    },

    // 🏗️ BUILD ARCHITECTURE
    build: {
      target: 'esnext', // Modern browsers only (High Performance)
      outDir: 'dist',
      sourcemap: !isProd, // Secure in prod
      minify: 'esbuild',
      chunkSizeWarningLimit: 1600,
      
      rollupOptions: {
        // 🚫 BACKEND EXCLUSION ZONE
        // Prevents Deno/Edge functions from leaking into Client bundle
        external: [
          /src\/supabase\/functions\/.*/,
        ],
        output: {
          // 🛡️ CACHE BUSTING NAMING CONVENTION
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/assets/[name]-[hash].[ext]',
          
          // 🧠 INTELLIGENT SPLIT POINTS
          manualChunks: (id) => {
            if (id.includes('@supabase')) return 'nexus-db';
            if (id.includes('node_modules/react')) return 'react-engine';
            
            // 🔒 SECURITY: Admin Code Isolation
            // Regular users never download the admin panel code
            if (id.includes('/src/components/admin/')) return 'admin-secure';

            if (id.includes('framer-motion')) return 'visuals';
          },
        },
      },
    },

    // 🚀 DEPENDENCY OPTIMIZATION
    optimizeDeps: {
      // We ignore backend folders to prevent Vite from analyzing Deno code
      exclude: ['@supabase/functions-js'], 
      entries: ['./src/main.jsx'], // 📍 YOUR EXACT ENTRY POINT
    }
  };
});
