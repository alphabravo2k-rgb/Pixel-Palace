/**
 * 🎨 PIXEL PALACE: POSTCSS ENGINE
 * ------------------------------
 * STATUS: MASTERED (GLOBAL STANDARD)
 * * CORE SYSTEMS:
 * 1. MODULARITY: Supports '@import' to keep files small and readable.
 * 2. COMPLIANCE: Uses W3C Standard CSS Nesting (Future-Proof).
 * 3. SPEED: Intelligent minification that strips comments in Production only.
 */

export default {
  plugins: {
    // 🔗 1. IMPORT MANAGER
    // Allows separating complex CSS into small, clean files (e.g. @import './admin.css')
    'postcss-import': {},

    // 🏗️ 2. STANDARD NESTING ENGINE
    // Wraps the native 'postcss-nesting' plugin.
    // Enables clean hierarchy:
    // .card { & .title { color: red } } -> Native CSS, not legacy Sass.
    'tailwindcss/nesting': 'postcss-nesting',

    // 🌊 3. TAILWIND CORE
    // The engine that processes your utility classes.
    tailwindcss: {},

    // 🛡️ 4. BROWSER DEFENSE (Autoprefixer)
    // Automatically adds -webkit- and -moz- flags.
    // Ensures the site works on an old Android phone just as well as a new iPhone.
    autoprefixer: {},

    // ⚡ 5. INDUSTRIAL COMPRESSION (Production Only)
    // If we are building for the world (Production), we crush the code size.
    // If we are developing (Dev), we keep it readable and fast.
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: [
          'default',
          {
            discardComments: { removeAll: true }, // 🗑️ Deletes all "/* comment */" to save bytes
            normalizeWhitespace: true, // 🤏 Removes all spaces/newlines
          },
        ],
      },
    } : {}),
  },
}
