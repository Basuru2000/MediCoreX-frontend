// vite.config.js - ALTERNATIVE SOLUTION
// If you don't want to add extensions to all imports, update your vite.config.js:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],  // Auto-resolve these extensions
    alias: {
      '@': '/src',  // Optional: allows @/components/... imports
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})