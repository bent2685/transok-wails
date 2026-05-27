import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    }
    return 'system'; // 默认跟随系统
  });

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const getActualTheme = (): 'light' | 'dark' => {
    return theme === 'system' ? getSystemTheme() : theme;
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const actualTheme = getActualTheme();
    
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    localStorage.setItem('theme', theme);

    // 监听系统主题变化
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(newSystemTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  return { 
    theme, 
    actualTheme: getActualTheme(),
    toggleTheme 
  };
};