/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Manual toggle support
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // 🛡️ SAFETY: Prevent purging of dynamic status classes used in React components
  // This ensures classes like 'bg-status-win' or 'text-brand' always exist
  safelist: [
    {
      pattern: /(bg|text|border|ring)-status-(win|loss|draw|active)/,
      variants: ['hover', 'group-hover'],
    },
    {
        pattern: /(bg|text|border)-brand/,
        variants: ['hover', 'focus']
    }
  ],

  theme: {
    extend: {
      // 🎨 DYNAMIC PALETTE (Backed by Supabase Database)
      // Usage: <div className="bg-brand/20 text-brand-glow">
      colors: {
        bg: {
          DEFAULT: '#050505', // Deep Void (OLED Black)
          panel: '#09090b',   // Zinc-950 (Cards/Panels)
          surface: '#121214', // Zinc-900 (Inputs/Hovers)
          elevated: '#18181b' // Zinc-800 (Modals/Dropdowns)
        },
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          dim: 'rgb(var(--color-brand-dim) / <alpha-value>)',
          glow: 'rgb(var(--color-brand-glow) / <alpha-value>)',
        },
        tactical: {
          DEFAULT: '#27272a', // Borders (Zinc-800)
          active: '#3f3f46',  // Active State (Zinc-700)
          highlight: '#52525b', // Text Secondary (Zinc-600)
        },
        status: {
          win: '#10b981',    // Emerald-500
          loss: '#ef4444',   // Red-500
          draw: '#eab308',   // Yellow-500
          active: '#3b82f6', // Blue-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        display: ['Teko', 'sans-serif'],    // Uppercase Headers
        hud: ['Rajdhani', 'sans-serif'],    // Numbers/Stats
      },
      boxShadow: {
        'neon': '0 0 20px -5px rgb(var(--color-brand) / 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'inner-glow': 'inset 0 0 20px rgb(var(--color-brand) / 0.1)',
      },
      animation: {
        'breathe': 'breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 2px rgb(var(--color-brand) / 0.3))' },
          '50%': { transform: 'scale(1.01)', filter: 'drop-shadow(0 0 10px rgb(var(--color-brand) / 0.5))' },
        },
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      // 📝 Markdown Theme: Makes text readable on black backgrounds automatically
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: 'rgb(var(--color-brand))',
              '&:hover': {
                color: 'rgb(var(--color-brand-glow))',
              },
            },
            h1: { color: theme('colors.white') },
            h2: { color: theme('colors.white') },
            h3: { color: theme('colors.gray.100') },
            strong: { color: theme('colors.white') },
            code: { color: 'rgb(var(--color-brand))' },
          },
        },
      }),
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/typography'),
  ],
};
