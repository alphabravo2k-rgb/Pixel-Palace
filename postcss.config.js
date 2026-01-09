/**
 * 🎨 PIXEL PALACE: POSTCSS OMNI-ENGINE
 * ------------------------------------
 * VERSION: 2050.1.0 (GENESIS OMNI)
 * STATUS: OPTIMIZED FOR 3D/8D INTEGRATION
 * * CORE SYSTEMS:
 * 1. MODULARITY: Supports '@import' to keep files small.
 * 2. NESTING: W3C Standard CSS Nesting (Critical for HUD component hierarchy).
 * 3. QUANTUM COMPRESSION: Aggressive but safe minification for 3D contexts.
 */

export default {
  plugins: {
    // 🔗 1. IMPORT MANAGER
    // Allows separating complex CSS into small, clean files (e.g. @import './admin.css')
    'postcss-import': {},

    // 🏗️ 2. HOLOGRAPHIC NESTING
    // Wraps the native 'postcss-nesting' plugin.
    // Essential for organizing the complex CSS required for 3D Cockpit HUDs
    'tailwindcss/nesting': 'postcss-nesting',

    // 🌊 3. TAILWIND KERNEL (V4 Ready)
    // The engine that processes your utility classes.
    tailwindcss: {},

    // 🛡️ 4. BROWSER DEFENSE (Autoprefixer)
    // Ensures 8D audio controls & 3D canvases render on all modern browsers
    autoprefixer: {},

    // ⚡ 5. QUANTUM COMPRESSION (Production Only)
    // If we are building for the world (Production), we crush the code size.
    // If we are developing (Dev), we keep it readable and fast.
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: [
          'default', // Kept 'default' for maximum stability. 'advanced' requires extra install.
          {
            discardComments: { removeAll: true }, // 🗑️ Deletes all "/* comment */" to save bytes
            normalizeWhitespace: true, // 🤏 Removes all spaces/newlines
            // ⚠️ CRITICAL 3D SAFEGUARDS ⚠️
            // We disable these optimizations to prevent breaking the 3D HUD Z-indexing
            // and keyframe animation names.
            reduceIdents: false, 
            zindex: false, 
          },
        ],
      },
    } : {}),
  },
}
