/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The "Pixel Palace" Palette
        brand: {
          DEFAULT: '#ff5500', // Signature Orange
          hover: '#ff7733',
          glow: 'rgba(255, 85, 0, 0.5)'
        },
        tactical: {
          surface: '#0b0c0f', // Deep Black/Blue (Card Backgrounds)
          raised: '#15191f',  // Slightly Lighter (Headers)
          border: '#27272a'   // Zinc-800 equivalent
        },
        ui: {
          bg: '#060709',      // Global Page Background
          border: 'rgba(255, 255, 255, 0.1)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'], // Critical for "Tactical" feel
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
