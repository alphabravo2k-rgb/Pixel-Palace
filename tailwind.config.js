/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ff5500', 
          hover: '#ff7733',
          glow: 'rgba(255, 85, 0, 0.5)'
        },
        tactical: {
          surface: '#0b0c0f', 
          raised: '#15191f',  
          border: '#27272a'   
        },
        ui: {
          bg: '#060709',
          border: 'rgba(255, 255, 255, 0.1)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        // ✅ ADDED: Official support for your headings
        teko: ['Teko', 'sans-serif'], 
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 85, 0, 0.35)',
        'glow-sm': '0 0 10px rgba(255, 85, 0, 0.25)',
        'tactical': '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'breathe': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
