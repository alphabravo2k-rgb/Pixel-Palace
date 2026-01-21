/**
 * ⚡ PIXEL PALACE — BUILD ENGINE SPECIFICATION
 * =============================================================================
 * FILE        : vite.config.js
 * MODULE      : Vite + Rollup Bundler
 * DOMAIN      : Infrastructure
 * SUBDOMAIN   : Asset Compilation & Delivery
 * OWNERSHIP   : Lead DevOps Engineer
 * RISK LEVEL  : CRITICAL
 * (Controls production bundling, chunk boundaries, and security headers)
 * =============================================================================
 *
 * RELEASE & GOVERNANCE
 * -----------------------------------------------------------------------------
 * VERSION     : INFRA@5.0.0
 * TAG         : PROD-BASELINE-V5
 * STATUS      : ENFORCED
 *
 * CHANGE POLICY:
 * - Plugin addition      → MINOR (Requires security audit)
 * - Chunking strategy    → MAJOR (Requires cache-busting validation)
 * - Env var handling     → MAJOR (Requires secret rotation check)
 *
 * =============================================================================
 * SYSTEM INTENT
 * -----------------------------------------------------------------------------
 * This module orchestrates the transformation of source code into production artifacts.
 * It enforces:
 * 1. Strict separation of concerns via manual chunking (Vendor vs. Core vs. 3D).
 * 2. Security-first asset delivery (CSP compliance support).
 * 3. Offline-first capability via PWA injection.
 *
 * =============================================================================
 * ENFORCEMENT & VERIFICATION
 * -----------------------------------------------------------------------------
 * VALIDATION:
 * - Bundle Size: Verified via 'rollup-plugin-visualizer' (Target: <500KB initial)
 * - PWA Integrity: Lighthouse CI score must be ≥ 95 in 'Best Practices'
 * - Secrets: 'env.VITE_*' check prevents build startup if keys missing.
 *
 * VIOLATIONS:
 * - Merging 'database-core' into 'vendor' chunk = REJECTED PR.
 * - Disabling 'strictPort' or 'cors' in server config = SECURITY BLOCKER.
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
import glsl from 'vite-plugin-glsl';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback Icons (Prevents 404s in CI/Preview environments)
const ICON_192 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%23050505'/%3E%3Cpath fill='%23c026d3' d='M256 100L100 412h312z' style='filter:drop-shadow(0 0 20px %23c026d3)' /%3E%3C/svg%3E";
const ICON_512 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%23050505'/%3E%3Cpath fill='%23c026d3' d='M256 100L100 412h312z' style='filter:drop-shadow(0 0 20px %23c026d3)' /%3E%3C/svg%3E";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  // 🛡️ SECURITY: Environment Integrity Check
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('FATAL: Missing Supabase Environment Variables. Build Aborted.');
  }

  return {
    root: '.',
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: 5173,
      host: true,
      strictPort: true, // Fail if port is in use (prevents port-swapping confusion)
      cors: true,
    },

    build: {
      target: 'esnext', // Optimization: Assume modern browser support
      outDir: 'dist',
      sourcemap: !isProd, // Security: Hide source code in production
      minify: 'esbuild',
      chunkSizeWarningLimit: 2000,
      
      rollupOptions: {
        output: {
          // 🧠 STRATEGY: Manual Chunking
          // Isolates heavy libraries to maximize cache hit rates for users.
          manualChunks: (id) => {
            if (id.includes('three') || id.includes('@react-three')) return 'engine-3d';
            if (id.includes('supabase')) return 'core-db';
            if (id.includes('framer-motion') || id.includes('lucide')) return 'core-ui';
            if (id.includes('node_modules')) return 'vendor';
          },
        },
      },
    },

    plugins: [
      react(),

      // Graphics: GLSL Shader Loader
      glsl({
        include: ['**/*.glsl', '**/*.vert', '**/*.frag'],
        warnDuplicatedImports: true,
        compress: isProd,
      }),
      
      // Capabilities: Progressive Web App
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Pixel Palace',
          short_name: 'Nexus',
          description: 'Competitive Gaming Infrastructure',
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,glsl}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Cache Strategy: Network First for API, Cache First for Assets
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 300 } 
              }
            }
          ]
        }
      }),

      // Performance: Brotli Compression
      isProd && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),

      // Analytics: Bundle Visualization
      visualizer({ filename: 'dist/stats.html', open: false })
    ].filter(Boolean),
  };
});
