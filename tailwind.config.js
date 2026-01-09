/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🌙 Manual toggle
  
  // 🎯 PRECISION TARGETING
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // 🛡️ SAFELIST PROTOCOL: Prevents dynamic class purging for DB statuses
  safelist: [
    {
      pattern: /(bg|text|border|ring|stroke|fill)-(status|brand|tactical)-(win|loss|draw|active|glow|dim|highlight)/,
      variants: ['hover', 'group-hover', 'focus-within', 'before', 'after', 'data-[state=open]'],
    },
    'animate-pulse-fast', 'animate-glitch', 'animate-scanline', 'animate-flicker', 'animate-scan',
    'perspective-1000', 'rotate-y-12' // 3D Utilities
  ],

  theme: {
    // 🌍 NATIVE E-SPORTS RESOLUTIONS (Mobile to Arena Screens)
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
      '3xl': '1920px', // Pro Player Native
      '4xl': '2560px', // Ultrawide / 2K
      '5xl': '3840px', // 4K Broadcast Standard
    },

    extend: {
      // 📝 FLUID TYPOGRAPHY: Scales perfectly across 25 years of hardware
      fontSize: {
        'fluid-xs': 'clamp(0.7rem, 0.6vw + 0.5rem, 0.8rem)',
        'fluid-base': 'clamp(0.9rem, 0.8vw + 0.7rem, 1.1rem)',
        'fluid-xl': 'clamp(1.25rem, 2vw + 1rem, 2.5rem)',
        'fluid-7xl': 'clamp(3rem, 8vw + 1rem, 8rem)', 
      },

      spacing: {
        'fluid-sm': 'clamp(0.5rem, 1vw, 1rem)',
        'fluid-md': 'clamp(1rem, 2vw, 2rem)',
        'fluid-lg': 'clamp(2rem, 4vw, 4rem)',
      },
      
      // 🖌️ COLOR PALETTE: The "Void" Theme
      colors: {
        bg: {
          DEFAULT: '#050505', // OLED Pitch Black
          panel: '#09090b',   // Zinc-950 (Cards)
          surface: '#121214', // Zinc-900 (Inputs)
          elevated: '#18181b', // Zinc-800 (Popovers)
          overlay: 'rgba(5, 5, 5, 0.8)', // Glassmorphism base
        },
        brand: {
          // 🧠 CSS VAR ABSTRACTION: Allows runtime theme switching (Team Colors)
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
          dispute: '#f97316', // Orange-500
          offline: '#3f3f46', // Zinc-700
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'], // Best for code/stats
        display: ['Teko', 'sans-serif'],    // Uppercase Headers (Aggressive)
        hud: ['Rajdhani', 'sans-serif'],    // Numbers/KDA Stats
      },

      // 🛠️ 3D & Z-INDEX MASTERY
      zIndex: {
        '60': '60', '70': '70', '80': '80', '90': '90', '100': '100',
      },
      perspective: {
        'none': 'none',
        'sm': '500px',
        'md': '1000px',
        'lg': '2000px',
      },
      rotate: {
        'cockpit': '-15deg',
      },

      boxShadow: {
        'neon': '0 0 25px -5px rgb(var(--color-brand) / 0.6)',
        'neon-purple': '0 0 25px -5px rgba(217,70,239, 0.6)', 
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'inner-glow': 'inset 0 0 20px rgb(var(--color-brand) / 0.15)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
      },

      // 🎬 GPU-ACCELERATED ANIMATIONS (144Hz Ready)
      animation: {
        'breathe': 'breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 0.4s cubic-bezier(.25,.46,.45,.94) both infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'flicker': 'flicker 3s linear infinite',
        'scan': 'scan 3s linear infinite', 
      },
      
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1) drop-shadow(0 0 2px rgb(var(--color-brand) / 0.3))' },
          '50%': { transform: 'scale(1.005)', filter: 'brightness(1.2) drop-shadow(0 0 15px rgb(var(--color-brand) / 0.6))' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)', opacity: '0.1' },
          '100%': { transform: 'translateY(100%)', opacity: '0.1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '0.99' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
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
    require('tailwind-scrollbar')({ nocompatible: true }), 
    require('@tailwindcss/typography'), 
    require('@tailwindcss/forms'), 
    require('@tailwindcss/container-queries'), 
    require('tailwindcss-animate'),
    
    // 🛠️ CUSTOM UTILITIES FOR GLASS & NEON
    function({ addUtilities }) {
      addUtilities({
        '.glass-hard': {
          'background': 'rgba(255, 255, 255, 0.02)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.text-neon': {
          'text-shadow': '0 0 10px rgb(var(--color-brand) / 0.8)',
        },
        '.clip-path-slant': {
          'clip-path': 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)',
        }
      })
    }
  ],
};
