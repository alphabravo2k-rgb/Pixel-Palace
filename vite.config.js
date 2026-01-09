import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import glsl from 'vite-plugin-glsl'; // 🎨 3D Shader Support

/**
 * 🏆 PIXEL PALACE: BURJ KHALIFA EDITION CONFIG
 * ---------------------------------------------
 * VISION: 2050 READY
 * STACK: React + Three.js + Supabase + PWA
 * * CORE SYSTEMS:
 * 1. 🧊 SMART CHUNKING: Separates 3D Engine, DB, and Vendor for instant loads.
 * 2. 🔮 GLSL SHADERS: Native support for raw shader files (The "3D Vision").
 * 3. 📱 PWA MASTER: Full offline support with embedded assets.
 * 4. ⚡ COMPRESSION: Brotli compression for maximum bandwidth efficiency.
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

    // 🏗️ BUILD ARCHITECTURE (The 25-Year Standard)
    build: {
      target: 'esnext', // 🚀 Future-proof JS
      outDir: 'dist',
      sourcemap: !isProd,
      minify: 'esbuild',
      chunkSizeWarningLimit: 2000,
      
      rollupOptions: {
        output: {
          // 🧠 INTELLIGENT CACHING STRATEGY
          // This ensures that updating your 3D code doesn't force users to re-download the database code.
          manualChunks: (id) => {
            // 1. The 3D Engine (Heavy, but updates rarely)
            if (id.includes('three') || id.includes('@react-three')) {
              return '3d-engine';
            }
            // 2. The Database Core (Critical security & logic)
            if (id.includes('supabase')) {
              return 'database-core';
            }
            // 3. UI Libraries (Animation, styling)
            if (id.includes('framer-motion') || id.includes('lucide')) {
              return 'ui-core';
            }
            // 4. Everything else (React, etc)
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },

    plugins: [
      react(),

      // 🎨 3D VISION: Native GLSL Support
      // Allows importing .glsl, .vert, .frag files directly for custom shaders
      glsl({
        include: [                   // Glob pattern, or array of glob patterns to import
          '**/*.glsl', '**/*.wgsl',
          '**/*.vert', '**/*.frag',
          '**/*.vs', '**/*.fs'
        ],
        exclude: undefined,          // Glob pattern, or array of glob patterns to ignore
        warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
        defaultExtension: 'glsl',    // Shader suffix when no extension is specified
        compress: isProd,            // Compress output shader code
        watch: true,                 // Recompile shader on change
        root: '/'                    // Directory for root imports
      }),
      
      // 📱 PWA: The Native App Experience
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Pixel Palace',
          short_name: 'Nexus',
          description: 'The World Standard for Competitive Gaming Infrastructure.',
          theme_color: '#050505',
          background_color: '#050505',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            { src: ICON_192, sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
            { src: ICON_512, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,glsl,vert,frag}'], // Cache shaders too!
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'nexus-api-data',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } 
              }
            }
          ]
        }
      }),

      // ⚡ COMPRESSION (Production Only)
      // Crushes 3D assets and code down to minimal size
      isProd && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),

      // 📊 ANALYTICS
      visualizer({ filename: 'dist/stats.html', open: false })
    ].filter(Boolean),
  };
});
