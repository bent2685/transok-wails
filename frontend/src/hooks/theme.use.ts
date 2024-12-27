import { defaultThemeName, storageKeyName, Theme } from '@/provider/theme.provider'
import { useEffect, useState } from 'react'

export type ThemeName = 'light' | 'dark' | 'system'

function useTheme() {
  const [themeName, setThemeName] = useState<ThemeName>(defaultThemeName)
  const [themeSet, _] = useState<Theme>(() => (localStorage.getItem(storageKeyName) as Theme) || defaultThemeName)

  useEffect(() => {
    if (themeSet !== 'system') {
      setThemeName(themeSet)
      return
    }
    // 设置初始皮肤
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeName('dark')
    } else {
      setThemeName('light')
    }
    // 监听系统颜色切换
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (event.matches) {
        setThemeName('dark')
      } else {
        setThemeName('light')
      }
    })
  }, [themeSet])

  useEffect(() => {
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [themeName])
  return {
    themeName,
    isDarkMode: themeName === 'dark',
    isLightMode: themeName === 'light'
  }
}

export default useTheme
