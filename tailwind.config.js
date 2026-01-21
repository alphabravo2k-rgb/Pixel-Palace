/**
 * ⚡ PIXEL PALACE — VISUAL PHYSICS SPECIFICATION
 * =============================================================================
 * FILE        : tailwind.config.js
 * MODULE      : Design Token Engine
 * DOMAIN      : UI / Presentation
 * OWNERSHIP   : Lead UI Engineer
 * RISK LEVEL  : HIGH
 * (Dictates global layout integrity, responsiveness, and accessibility colors)
 * =============================================================================
 *
 * RELEASE & GOVERNANCE
 * -----------------------------------------------------------------------------
 * VERSION     : DESIGN@5.0.0
 * TAG         : VOID-THEME-V5
 * STATUS      : ENFORCED
 *
 * CHANGE POLICY:
 * - Color palette tweak       → PATCH (Visual regression test recommended)
 * - Breakpoint modification   → MAJOR (Requires full device lab audit)
 * - Animation timing change   → MINOR
 *
 * =============================================================================
 * SYSTEM INTENT
 * -----------------------------------------------------------------------------
 * This configuration serves as the Single Source of Truth for the application's
 * visual physics. It implements the "Void" design language:
 * - Absolute Black (#020202) foundations.
 * - Optical sizing via fluid typography clamps.
 * - GPU-accelerated motion primitives.
 *
 * =============================================================================
 * ENFORCEMENT & VERIFICATION
 * -----------------------------------------------------------------------------
 * VALIDATION:
 * - Contrast Ratios: Status colors must meet WCAG AA via CI linting.
 * - Purge Safety: Dynamic classes (e.g., status badges) are explicitly safelisted.
 *
 * VIOLATIONS:
 * - Removing Safelist patterns = REJECTED (Breaks dynamic data rendering).
 * - Adding arbitrary hex values (e.g. text-[#123456]) = WARNING (Use tokens).
 *
 * =============================================================================
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  
  // 🛡️ CRITICAL: SAFELIST PROTOCOL
  // These patterns prevent the JIT engine from discarding classes derived from database values.
  safelist: [
    // Status Indicators (Win/Loss/Live)
    {
      pattern: /(bg|text|border|ring|stroke|fill)-(status|brand|tactical)-(win|loss|draw|active|glow|dim|highlight)/,
      variants: ['hover', 'group-hover', 'focus-within', 'before', 'after', 'data-[state=open]'],
    },
    // Role Hierarchy Colors
    {
      pattern: /(text|bg|border)-(yellow|fuchsia|blue|red|orange|emerald|zinc|rose)-(400|500|600)/,
      variants: ['hover', 'active', 'before', 'after'],
    },
    // 3D & Animation Utilities (Required for dynamic HUDs)
    'animate-pulse-fast', 
    'animate-glitch', 
    'animate-scanline', 
    'perspective-1000', 
    'rotate-y-12',
    'shadow-neon-yellow',
    'shadow-neon-purple'
  ],

  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
      '3xl': '1920px', // Esports Standard
      '4xl': '2560px', 
      '5xl': '3840px', 
    },

    extend: {
      // Fluid Typography: Scale = Base + Viewport Modifier
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
      
      colors: {
        bg: {
          DEFAULT: '#020202', // Void Base
          panel: '#09090b',   // Zinc-950
          surface: '#121214', // Zinc-900
          elevated: '#18181b', // Zinc-800
          overlay: 'rgba(5, 5, 5, 0.8)',
          glass: 'rgba(5, 5, 5, 0.4)',
        },
        brand: {
          DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
          dim: 'rgb(var(--brand-dim-rgb) / <alpha-value>)',
          glow: 'rgb(var(--brand-glow-rgb) / <alpha-value>)',
        },
        tactical: {
          DEFAULT: '#27272a',
          active: '#3f3f46',
          highlight: '#52525b',
          muted: '#71717a',
        },
        status: {
          win: '#10b981',    
          loss: '#ef4444',   
          draw: '#eab308',   
          active: '#3b82f6', 
          dispute: '#f97316', 
          live: '#22c55e',   
          elo: '#6366f1',    
          offline: '#3f3f46',
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Teko', 'sans-serif'],
        hud: ['Rajdhani', 'sans-serif'],
      },

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
        'neon': '0 0 25px -5px rgb(var(--brand-rgb) / 0.6)',
        'neon-strong': '0 0 40px -10px rgb(var(--brand-rgb) / 0.8)',
        'neon-purple': '0 0 25px -5px rgba(217,70,239, 0.6)', 
        'neon-red': '0 0 25px -5px rgba(239, 68, 68, 0.5)',
        'neon-yellow': '0 0 25px -5px rgba(234, 179, 8, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.02), 0 10px 30px rgba(0, 0, 0, 0.5)',
      },

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
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1) drop-shadow(0 0 2px rgb(var(--brand-rgb) / 0.3))' },
          '50%': { transform: 'scale(1.005)', filter: 'brightness(1.2) drop-shadow(0 0 15px rgb(var(--brand-rgb) / 0.6))' },
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

      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.zinc[400]'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': 'rgb(var(--brand-rgb))',
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-code': 'rgb(var(--brand-rgb))',
            '--tw-prose-pre-bg': theme('colors.bg.surface'),
            '--tw-prose-quote-borders': 'rgb(var(--brand-rgb))',
          },
        },
      }),
    },
  },
  
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }), 
    require('@tailwindcss/typography'), 
    require('@tailwindcss/forms'), 
    require('@tailwindcss/container-queries'), 
    require('tailwindcss-animate'),
    
    // Utility injection for complex visual effects
    function({ addUtilities }) {
      addUtilities({
        '.glass-hard': {
          'background': 'rgba(255, 255, 255, 0.02)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
        '.text-neon': {
          'text-shadow': '0 0 10px rgb(var(--brand-glow-rgb) / 0.8)',
        },
        '.clip-path-slant': {
          'clip-path': 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)',
        }
      })
    }
  ],
};
