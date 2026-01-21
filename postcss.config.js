/**
 * ⚡ PIXEL PALACE — STYLE COMPILER CONFIGURATION
 * =============================================================================
 * FILE        : postcss.config.js
 * CONFIG      : PostCSS + cssnano
 * DOMAIN      : Visual Infrastructure
 * SUBDOMAIN   : CSS Compilation & Optimization
 * LAYER       : Build → Styles
 * OWNERSHIP   : Lead UI/UX Engineer
 * RISK LEVEL  : HIGH
 * (Controls CSS minification, prefixing, and 3D stacking context safety)
 * =============================================================================
 *
 * RELEASE & GOVERNANCE
 * -----------------------------------------------------------------------------
 * VERSION     : v5.0.0
 * REVISION ID : STYLE-PROC-050
 * RELEASE TAG : BURJ-KHALIFA-STANDARD
 * LAST UPDATE : 2026-01-22
 * STATUS      : OPERATIONAL
 * VISIBILITY  : GLOBAL
 *
 * CHANGE GOVERNANCE:
 * - Plugin order change      → MAJOR (Can break precedence)
 * - Minification preset      → MINOR
 *
 * =============================================================================
 * SYSTEM ROLE & INTENT
 * -----------------------------------------------------------------------------
 * This module transforms developer-friendly CSS/Tailwind into browser-optimized
 * artifacts.
 *
 * CRITICAL SAFEGUARDS:
 * 1. Z-INDEX SAFETY    : cssnano's z-index rebasing is DISABLED.
 * We need absolute z-index control for the 3D HUD layers.
 * 2. ANIMATION SAFETY  : reduceIdents is DISABLED.
 * Prevents keyframe names from being mangled, preserving
 * complex GPU animations defined in tailwind.config.js.
 *
 * =============================================================================
 */

export default {
  plugins: {
    // 🔗 1. IMPORT MANAGER
    // Allows separating complex CSS into small, clean files (e.g. @import './admin.css')
    // Must run first to inline content before processing.
    'postcss-import': {},

    // 🏗️ 2. HOLOGRAPHIC NESTING
    // Wraps the native 'postcss-nesting' plugin.
    // Essential for organizing the complex hierarchical CSS required for 3D Cockpit HUDs.
    'tailwindcss/nesting': 'postcss-nesting',

    // 🌊 3. TAILWIND KERNEL
    // The engine that scans your HTML/JSX and generates utility classes.
    tailwindcss: {},

    // 🛡️ 4. BROWSER DEFENSE (Autoprefixer)
    // Automatically adds -webkit-, -moz-, -ms- prefixes.
    // Ensures 8D audio controls & 3D canvases render on all modern browsers.
    autoprefixer: {},

    // ⚡ 5. QUANTUM COMPRESSION (Production Only)
    // If we are building for the world (Production), we crush the code size.
    // If we are developing (Dev), we keep it readable and fast.
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: [
          'default', // Kept 'default' for maximum stability.
          {
            discardComments: { removeAll: true }, // 🗑️ Deletes all comments to save bytes
            normalizeWhitespace: true, // 🤏 Removes all spaces/newlines
            
            // ⚠️ CRITICAL 3D SAFEGUARDS ⚠️
            // We disable these optimizations to prevent breaking the 3D HUD.
            
            // PRESERVES KEYFRAME NAMES: Essential for 'animate-glitch', 'animate-scanline'
            reduceIdents: false, 
            
            // PRESERVES STACKING CONTEXT: Essential for the 15-layer UI Z-index system
            zindex: false, 
          },
        ],
      },
    } : {}),
  },
}
