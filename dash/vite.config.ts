import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build output is emitted into the Go backend's embedded templates directory
// so `go:embed templates/downpage/*` picks it up automatically.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../backend/app/templates/downpage',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/serv/': {
        target: 'http://localhost:9482',
        secure: false,
        changeOrigin: true,
        rewrite: path => {
          return path.replace(/^\/serv/, '')
        }
      }
    }
  }
})
