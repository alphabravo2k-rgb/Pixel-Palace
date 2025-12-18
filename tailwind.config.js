/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The "Tactical Intel" Palette
        brand: {
          DEFAULT: '#ff5500', // Signature Orange
          50: '#fff1eb',
          100: '#ffd4c2',
          dim: '#ff55001a', // Fixed: Hex alpha for better compatibility
          hover: '#ff7733',
        },
        tactical: {
          // @deprecated - Remove after Q1 2026. Use 'surface' or 'raised' instead.
          legacy_appBg: '#060709', 
          surface: '#0b0c0f', // Component Background (Card/Modal)
          raised: '#15191f', // Secondary Background (Header/Row)
        },
        // Semantic Status Colors (Team-Proofing)
        // Contract: Use status.* for TEXT/ICONS/BORDERS only. Use statusBg.* for BACKGROUNDS.
        status: {
          success: '#22c55e', // Emerald-500
          warning: '#facc15', // Yellow-400
          error: '#ef4444',   // Red-500
          info: '#3b82f6',    // Blue-500
        },
        // Sanctioned Background Variants (10% Opacity)
        statusBg: {
          success: '#22c55e1a',
          warning: '#facc151a',
          error: '#ef44441a',
          info: '#3b82f61a',
        },
        ui: {
          border: '#27272a',  // Zinc-800
          muted: '#71717a',   // Zinc-500
          text: {
            primary: '#e5e7eb',   // Zinc-200 (High Contrast)
            secondary: '#9ca3af', // Zinc-400 (Low Contrast)
          }
        },
        // Platform Branding
        social: {
          discord: '#5865F2',
          faceit: '#ff5500', // Coincidentally same as brand, tracked separately
          steam: '#171a21',
        }
      },
      fontFamily: {
        mono: [
          'ui-monospace', 
          'SFMono-Regular', 
          'Menlo', 
          'Monaco', 
          'Consolas', 
          '"Liberation Mono"', 
          '"Courier New"', 
          'monospace'
        ],
        sans: [
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Segoe UI"', 
          'Roboto', 
          '"Helvetica Neue"', 
          'Arial', 
          'sans-serif'
        ],
      },
      // Enforced Typography Scale (Anchors)
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],   // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],    // 16px (Standard Body)
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px (Headings)
      },
      // Hierarchy Weights - Adjusted for readability
      fontWeight: {
        normal: '400',
        medium: '500',
        tactical: '600',       // Primary Hierarchy (Headers/Labels)
        'tactical-heavy': '700' // Rare Emphasis Only
      },
      // Semantic Letter Spacing - Restrained
      letterSpacing: {
        compact: '-0.03em', // Tables, dense stats
        tactical: '0.08em', // Headers, labels (Intentional, not shouting)
      },
      // Design Tokens: Spacing & Radius
      spacing: {
        'tactical-dense': '0.5rem',   // Tables, inline controls
        'tactical-card': '1rem',      // Standard card padding
        'tactical-section': '2rem',   // Section gaps
      },
      borderRadius: {
        'tactical': '0.125rem',       // Sharp/Industrial (2px) - Inputs, Buttons
        'tactical-soft': '0.375rem',  // Softer (6px) - Cards, Modals
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        }
      }
    },
  },
  plugins: [],
}
