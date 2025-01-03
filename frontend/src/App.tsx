import React, { useEffect, Suspense } from 'react'
import TitleBar from './components/TitleBar/TItleBar'
import { ThemeProvider } from './provider/theme.provider'
import { ConfirmProvider } from './provider/confirm.provider'
import { SpinProvider } from './provider/spin.provider'
import useTheme from './hooks/theme.use'
import MainLayout from './@layout/MainLayout'
import { Toaster } from 'sonner'
function App() {
  useTheme()

  return (
    <React.Fragment>
      <ThemeProvider storageKey="vite-ui-theme">
        <Suspense fallback={null}>
          <ConfirmProvider>
            <SpinProvider>
              <div id="App" className="h-100vh">
                <MainLayout />
                <Toaster />
              </div>
            </SpinProvider>
          </ConfirmProvider>
        </Suspense>
      </ThemeProvider>
    </React.Fragment>
  )
}

export default App
