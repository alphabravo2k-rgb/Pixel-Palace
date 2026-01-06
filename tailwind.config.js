/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🌙 Manual toggle (System preference is too unpredictable for gamers)
  
  // 🎯 PRECISION TARGETING
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // 🛡️ SAFELIST PROTOCOL: Prevents dynamic class purging
  // Critical for fetching match statuses from Supabase (e.g., status === 'win' -> 'bg-status-win')
  safelist: [
    {
      pattern: /(bg|text|border|ring|stroke|fill)-(status|brand|tactical)-(win|loss|draw|active|glow|dim|highlight)/,
      variants: ['hover', 'group-hover', 'focus-within', 'before', 'after', 'data-[state=open]'],
    },
    // Ensure animation utilities are never purged
    'animate-pulse-fast', 'animate-glitch', 'animate-scanline'
  ],

  theme: {
    // 🌍 GLOBAL GRID: Supports Phones (320px) to Super-Ultrawides (3840px)
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: { 
        '2xl': '1400px',
        '3xl': '1920px', // Full HD Native
        '4xl': '2560px', // 2K / Ultrawide
      },
    },
    extend: {
      // 🎨 FLUID SCALING: Text/Spacing adapts to screen size automatically
      spacing: {
        'fluid-sm': 'clamp(0.5rem, 1vw, 1rem)',
        'fluid-md': 'clamp(1rem, 2vw, 2rem)',
        'fluid-lg': 'clamp(2rem, 4vw, 4rem)',
      },
      
      // 🖌️ COLOR PALETTE: The "Void" Theme
      colors: {
        bg: {
          DEFAULT: '#050505', // OLED Pitch Black (Battery Saver & Aesthetic)
          panel: '#09090b',   // Zinc-950 (Cards)
          surface: '#121214', // Zinc-900 (Inputs)
          elevated: '#18181b', // Zinc-800 (Popovers)
          overlay: 'rgba(5, 5, 5, 0.8)', // Glassmorphism base
        },
        brand: {
          // 🧠 CSS VAR ABSTRACTION: Allows runtime theme switching (e.g. Team Colors)
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          dim: 'rgb(var(--color-brand-dim) / <alpha-value>)',
          glow: 'rgb(var(--color-brand-glow) / <alpha-value>)',
        },
        tactical: {
          DEFAULT: '#27272a', // Borders (Zinc-800)
          active: '#3f3f46',  // Active/Pressed (Zinc-700)
          highlight: '#52525b', // Icons/Text (Zinc-600)
          muted: '#71717a',   // Disabled (Zinc-500)
        },
        status: {
          win: '#10b981',    // Emerald-500
          loss: '#ef4444',   // Red-500
          draw: '#eab308',   // Yellow-500
          active: '#3b82f6', // Blue-500
          offline: '#3f3f46', // Zinc-700
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'], // Best for code/stats
        display: ['Teko', 'sans-serif'],    // Uppercase Headers (Aggressive)
        hud: ['Rajdhani', 'sans-serif'],    // Numbers/KDA Stats
      },

      // 🛠️ Z-INDEX MASTERY: 100 Layers of depth
      zIndex: {
        '60': '60', // Sticky Headers
        '70': '70', // Dropdowns
        '80': '80', // Modals
        '90': '90', // Toast Notifications
        '100': '100', // Critical Error Overlays
      },

      boxShadow: {
        'neon': '0 0 25px -5px rgb(var(--color-brand) / 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'inner-glow': 'inset 0 0 20px rgb(var(--color-brand) / 0.15)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
      },

      // 🎬 GPU-ACCELERATED ANIMATIONS (144Hz Ready)
      animation: {
        'breathe': 'breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 0.8s cubic-bezier(.25,.46,.45,.94) infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite', // For Loading Skeletons
      },
      
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1) drop-shadow(0 0 2px rgb(var(--color-brand) / 0.3))', willChange: 'transform, filter' },
          '50%': { transform: 'scale(1.005)', filter: 'brightness(1.2) drop-shadow(0 0 15px rgb(var(--color-brand) / 0.6))' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate3d(0,0,0)', willChange: 'transform' },
          '20%': { transform: 'translate3d(-2px, 2px, 0)' },
          '40%': { transform: 'translate3d(2px, -2px, 0)' },
          '60%': { transform: 'translate3d(-1px, -1px, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)', willChange: 'transform' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)', opacity: '0.1' },
          '100%': { transform: 'translateY(100%)', opacity: '0.1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },

      // 📝 PROSE MASTERY: For Blogs/Rules/Announcements
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.zinc[400]'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': 'rgb(var(--color-brand))',
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-code': 'rgb(var(--color-brand))',
            '--tw-prose-pre-bg': theme('colors.bg.surface'),
            '--tw-prose-quote-borders': 'rgb(var(--color-brand))',
          },
        },
      }),
    },
  },
  
  // 🔌 PLUGINS: The Toolkit
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }), // Custom scrollbars
    require('@tailwindcss/typography'), // Markdown support
    require('@tailwindcss/forms'), // Better inputs
    require('@tailwindcss/container-queries'), // 🚀 FUTURE: Components own their responsiveness
    require('tailwindcss-animate'), // Animation utilities
  ],
};
