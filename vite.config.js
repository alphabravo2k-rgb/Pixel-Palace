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
 * STATUS: MASTERED (STABLE BUILD FIX)
 * ARCHITECT: GEMINI & FOUNDER
 * * CHANGES:
 * 1. REMOVED manual chunking for React/Framer (Fixes 'createContext' crash).
 * 2. EMBEDDED Icons directly (Fixes Manifest 404 error).
 * 3. SIMPLIFIED build strategy for maximum stability.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔮 DATA URI ICONS (No physical files needed - Prevents 404s)
const ICON_192 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%23050505'/%3E%3Cpath fill='%23c026d3' d='M256 100L100 412h312z' style='filter:drop-shadow(0 0 20px %23c026d3)' /%3E%3C/svg%3E";
const ICON_512 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%23050505'/%3E%3Cpath fill='%23c026d3' d='M256 100L100 412h312z' style='filter:drop-shadow(0 0 20px %23c026d3)' /%3E%3C/svg%3E";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  // 🛡️ INTEGRITY CHECK
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ CRITICAL WARNING: Supabase Environment Variables are missing!');
  }

  return {
    root: '.',
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // 🖥️ SERVER
    server: {
      port: 5173,
      host: true,
      strictPort: true,
      cors: true,
    },

    // 🏗️ BUILD ARCHITECTURE
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: !isProd,
      minify: 'esbuild',
      chunkSizeWarningLimit: 2000,
      
      rollupOptions: {
        output: {
          // 🛡️ SAFE CHUNKING: Only split vendor (node_modules) from source.
          // We removed the aggressive React/Framer split to prevent race conditions.
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },

    plugins: [
      react(),
      
      // 📱 PWA: The Native App Experience
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Pixel Palace',
          short_name: 'Nexus',
          description: 'Global Standard Competitive Platform',
          theme_color: '#050505',
          background_color: '#050505',
          display: 'standalone',
          orientation: 'portrait',
          // ✅ FIX: Use Data URIs directly in the build config
          icons: [
            { src: ICON_192, sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
            { src: ICON_512, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'nexus-api-data',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } // Cache DB data for 5 mins
              }
            }
          ]
        }
      }),

      // ⚡ COMPRESSION (Production Only)
      isProd && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),

      visualizer({ filename: 'dist/stats.html', open: false })
    ].filter(Boolean),
  };
});
