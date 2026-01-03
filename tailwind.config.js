/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 🎨 DYNAMIC PALETTE (Backed by Database)
      colors: {
        bg: {
          DEFAULT: '#050505', // Deep Void
          panel: '#09090b',   // Zinc-950
          surface: '#121214', // Zinc-900
        },
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)', 
          dim: 'rgb(var(--color-brand-dim) / <alpha-value>)',
          glow: 'rgb(var(--color-brand-glow) / <alpha-value>)',
        },
        tactical: {
          DEFAULT: '#27272a',
          active: '#3f3f46',
          highlight: '#52525b',
        },
        status: {
          win: '#10b981',  
          loss: '#ef4444', 
          draw: '#eab308', 
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        display: ['Teko', 'sans-serif'], 
        hud: ['Rajdhani', 'sans-serif'], 
      },
      boxShadow: {
        'neon': '0 0 20px rgb(var(--color-brand) / 0.4)', 
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'breathe': 'breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 5px rgb(var(--color-brand) / 0.5))' },
          '50%': { transform: 'scale(1.02)', filter: 'drop-shadow(0 0 15px rgb(var(--color-brand) / 0.7))' },
        },
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/typography'),
  ],
};
