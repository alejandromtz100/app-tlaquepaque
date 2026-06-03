import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Muy importante para que funcione con file:// en Electron
  base: './',
  server: {
    proxy: {
      '/uploads': { target: 'https://apiobraspublicas.tlaquepaque.gob.mx', changeOrigin: true, secure: true },
      '/directores-obra': { target: 'https://apiobraspublicas.tlaquepaque.gob.mx', changeOrigin: true, secure: true },
    },
  },
})
