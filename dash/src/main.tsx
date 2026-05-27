import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DownloadManager } from './services/downloadManager'

// 配置并尝试注册 SW（非安全上下文会静默降级，runLegacy 自动兜底）
const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '') as string
DownloadManager.configure({
  baseUrl,
  getCaptcha: () => localStorage.getItem('captcha'),
})
DownloadManager.init()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
