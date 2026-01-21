/**
 * ⚡ PIXEL PALACE — STYLE COMPILER SPECIFICATION
 * =============================================================================
 * FILE        : postcss.config.js
 * MODULE      : PostCSS Pipeline
 * DOMAIN      : Visual Infrastructure
 * SUBDOMAIN   : CSS Compilation & Optimization
 * OWNERSHIP   : Lead UI Engineer
 * RISK LEVEL  : HIGH
 * (Controls CSS minification stability and cross-browser compatibility)
 * =============================================================================
 *
 * RELEASE & GOVERNANCE
 * -----------------------------------------------------------------------------
 * VERSION     : STYLE@5.0.0
 * TAG         : POSTCSS-CORE-V5
 * STATUS      : ENFORCED
 *
 * CHANGE POLICY:
 * - Plugin ordering update   → MAJOR (Breaks cascade precedence)
 * - Minification preset      → MINOR (Requires regression test on 3D elements)
 *
 * =============================================================================
 * SYSTEM INTENT
 * -----------------------------------------------------------------------------
 * This module transforms developer-authored CSS into browser-optimized artifacts.
 * It strictly disables unsafe optimizations (Z-Index rebasing) to preserve the
 * complex stacking contexts required by the 3D HUD system.
 *
 * =============================================================================
 * ENFORCEMENT & VERIFICATION
 * -----------------------------------------------------------------------------
 * VALIDATION:
 * - Browser Support: Validated via Autoprefixer against 'browserslist' config.
 * - Animation Integrity: 'reduceIdents' must remain FALSE to prevent keyframe breakage.
 *
 * VIOLATIONS:
 * - Enabling 'zindex: true' in cssnano = REJECTED (Breaks 3D overlay stacking).
 * - Removing 'postcss-import' from start of chain = BLOCKER (Breaks @import handling).
 *
 * =============================================================================
 */

export default {
  plugins: {
    // 1. Dependency Resolution
    // Must be first to inline @import statements before other processing.
    'postcss-import': {},

    // 2. CSS Nesting Support
    // Enables W3C standard nesting syntax (essential for component encapsulation).
    'tailwindcss/nesting': 'postcss-nesting',

    // 3. Utility Generation
    // Scans content files and generates atomic CSS.
    tailwindcss: {},

    // 4. Vendor Prefixing
    // Adds prefixes for cross-browser compatibility (Flexbox, Grid, etc).
    autoprefixer: {},

    // 5. Minification (Production Only)
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
            normalizeWhitespace: true,
            
            // 🛡️ CRITICAL SAFEGUARDS 🛡️
            // These optimizations are explicitly DISABLED to prevent breaking
            // the application's visual architecture.
            
            // PRESERVES KEYFRAMES: Essential for 'animate-glitch', 'animate-scanline'
            reduceIdents: false, 
            
            // PRESERVES STACKING: Essential for 15-layer UI Z-index system
            zindex: false, 
          },
        ],
      },
    } : {}),
  },
}
