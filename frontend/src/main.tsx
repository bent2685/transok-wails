import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import 'virtual:uno.css'
import './assets/styles/theme.css'
import './assets/styles/base.scss'
import { HashRouter } from 'react-router-dom'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <HashRouter>
      <Suspense>
        <App />
      </Suspense>
    </HashRouter>
  </React.StrictMode>
)
