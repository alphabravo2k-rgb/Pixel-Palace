export default {
  plugins: {
    // 1. Tailwind: Compiles your utility classes
    tailwindcss: {},
    
    // 2. Autoprefixer: Adds browser compatibility flags (e.g. -webkit-flex)
    // This MUST run after Tailwind to catch the generated CSS.
    autoprefixer: {},
  },
}
