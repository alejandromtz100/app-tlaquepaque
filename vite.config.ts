import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Muy importante para que funcione con file:// en Electron
  base: './',
  server: {
    proxy: {
      '/uploads': { target: 'http://10.50.4.207:3001', changeOrigin: true },
      '/directores-obra': { target: 'http://10.50.4.207:3001', changeOrigin: true },
    },
  },
})
