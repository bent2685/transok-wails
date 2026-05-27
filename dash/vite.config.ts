import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// Build output is emitted into the Go backend's embedded templates directory
// so `go:embed templates/downpage/*` picks it up automatically.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // 9482 matches the default port stored by the desktop app (frontend Home.tsx).
  // `gin.go` only falls back to 4343 if no port is passed — runtime uses 9482.
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:9482'

  const proxyConfig: Record<string, ProxyOptions> = {
    '/api': { target: backendUrl, changeOrigin: true, secure: false },
    '/share': { target: backendUrl, changeOrigin: true, secure: false },
    '/download': { target: backendUrl, changeOrigin: true, secure: false }
  }

  return {
    plugins: [react()],
    base: './',
    build: {
      outDir: '../backend/app/templates/downpage',
      emptyOutDir: true
    },
    server: {
      port: 3000,
      host: true,
      proxy: proxyConfig
    },
    preview: {
      port: 3001,
      host: true,
      proxy: proxyConfig
    }
  }
})
