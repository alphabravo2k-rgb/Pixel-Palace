/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 THEME ALIGNMENT: Matches your 'Manifesto' visuals
        bg: {
          DEFAULT: '#050505', // Deep Void
          panel: '#121214',   // Glass Panel Base
        },
        brand: {
          DEFAULT: '#c026d3', // Fuchsia 600
          glow: '#e879f9',    // Fuchsia 400
          dark: '#701a75',    // Fuchsia 900
        },
        tactical: {
          surface: '#0b0c0f', 
          border: '#27272a'   
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        // ✅ TYPOGRAPHY: Your signature fonts
        teko: ['Teko', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(192, 38, 211, 0.4)', // Purple Glow
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'breathe': 'breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.5))' },
          '50%': { transform: 'scale(1.03)', filter: 'drop-shadow(0 0 25px rgba(236, 72, 153, 0.7))' },
        }
      }
    },
  },
  plugins: [],
}
