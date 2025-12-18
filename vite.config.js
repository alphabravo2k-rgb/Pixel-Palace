import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Fail if port 3000 is taken (prevents confusion)
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Security: Don't expose source code in production
  }
})
