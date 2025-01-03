import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'virtual:uno.css'
import './assets/styles/theme.css'
import './assets/styles/base.scss'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { initI18n } from './i18n'

const container = document.getElementById('root')

const root = createRoot(container!)

// 确保 i18n 初始化完成后再渲染应用
initI18n().then(() => {
  root.render(
    <BrowserRouter>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  )
})
