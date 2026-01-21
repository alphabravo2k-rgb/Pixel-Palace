/**
 * ⚡ PIXEL PALACE — BUILD ENGINE CONFIGURATION
 * =============================================================================
 * FILE        : vite.config.js
 * CONFIG      : Vite + Rollup
 * DOMAIN      : Core Infrastructure
 * SUBDOMAIN   : Build Pipeline & Optimization
 * LAYER       : DevOps / Tooling
 * OWNERSHIP   : Core Engineering Lead
 * RISK LEVEL  : CRITICAL
 * (Controls production bundling, chunking, and PWA generation)
 * =============================================================================
 *
 * RELEASE & GOVERNANCE
 * -----------------------------------------------------------------------------
 * VERSION     : v5.0.0
 * REVISION ID : INFRA-VITE-050
 * RELEASE TAG : BURJ-KHALIFA-STANDARD
 * LAST UPDATE : 2026-01-22
 * STATUS      : OPERATIONAL
 * VISIBILITY  : REPO-ROOT
 *
 * CHANGE GOVERNANCE:
 * - Plugin addition/removal  → MINOR
 * - Chunking strategy change → MAJOR (Requires perf audit)
 * - Env var logic change     → MAJOR
 *
 * =============================================================================
 * SYSTEM ROLE & INTENT
 * -----------------------------------------------------------------------------
 * This module is the HEART of the application delivery system.
 * It is responsible for:
 * - Transpiling Modern JS (ESNext) -> Browser Compatible Code
 * - 3D Shader Compilation (.glsl support)
 * - Intelligent Code Splitting (separating 3D engine from UI logic)
 * - PWA Manifest Generation & Offline Caching
 *
 * =============================================================================
 * OPTIMIZATION STRATEGY (THE 2050 STANDARD)
 * -----------------------------------------------------------------------------
 * 1. SMART CHUNKING : 3D Engine, Database, and UI are split to prevent
 * re-downloading the massive Three.js runtime on every
 * small logic tweak.
 * 2. BROTLI COMP.   : Native compression for assets.
 * 3. GLSL SUPPORT   : Raw shader import support for high-fidelity graphics.
 *
 * =============================================================================
 * DEPENDENCY BOUNDARY
 * -----------------------------------------------------------------------------
 * - Inputs : Source Code (/src), Public Assets (/public), Env Vars
 * - Outputs: /dist folder (Production Artifacts)
 *
 * =============================================================================
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import glsl from 'vite-plugin-glsl'; // 🎨 3D Shader Support

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔮 DATA URI ICONS (Prevents 404s during build/deploy previews)
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

    // 🖥️ SERVER CONFIG
    server: {
      port: 5173,
      host: true,
      strictPort: true,
      cors: true,
    },

    // 🏗️ BUILD ARCHITECTURE
    build: {
      target: 'esnext', // 🚀 Future-proof JS for maximum performance
      outDir: 'dist',
      sourcemap: !isProd, // Disable source maps in prod for security/size
      minify: 'esbuild',
      chunkSizeWarningLimit: 2000,
      
      rollupOptions: {
        output: {
          // 🧠 INTELLIGENT CACHING STRATEGY
          manualChunks: (id) => {
            // 1. The 3D Engine (Heavy, rarely updates)
            if (id.includes('three') || id.includes('@react-three')) {
              return '3d-engine';
            }
            // 2. The Database Core (Critical logic)
            if (id.includes('supabase')) {
              return 'database-core';
            }
            // 3. UI Libraries (Animation, styling)
            if (id.includes('framer-motion') || id.includes('lucide')) {
              return 'ui-core';
            }
            // 4. Vendor (React, Router, etc)
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
      glsl({
        include: [
          '**/*.glsl', '**/*.wgsl',
          '**/*.vert', '**/*.frag',
          '**/*.vs', '**/*.fs'
        ],
        warnDuplicatedImports: true,
        defaultExtension: 'glsl',
        compress: isProd,
        watch: true,
        root: '/'
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,glsl,vert,frag}'],
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
