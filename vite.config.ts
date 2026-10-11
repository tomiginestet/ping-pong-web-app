import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Rutas relativas para poder publicarla en cualquier hosting estático (GitHub Pages, Vercel, Netlify...).
  base: './',
})
