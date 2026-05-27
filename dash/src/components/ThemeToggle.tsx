import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor size={14} className="sm:w-4 sm:h-4" />;
    }
    return actualTheme === 'light' ? 
      <Moon size={14} className="sm:w-4 sm:h-4" /> : 
      <Sun size={14} className="sm:w-4 sm:h-4" />;
  };

  const getAriaLabel = () => {
    if (theme === 'system') return 'Switch to light mode';
    if (theme === 'light') return 'Switch to dark mode';
    return 'Switch to system mode';
  };

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed top-3 right-4 xs:right-6 sm:top-4 sm:right-6 lg:top-6 lg:right-8 z-50 p-2 sm:p-3 rounded-lg clean-button text-gray-600 dark:text-gray-300 flex items-center justify-center"
      aria-label={getAriaLabel()}
    >
      <motion.div
        key={theme} // 添加 key 以触发重新渲染动画
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {getIcon()}
      </motion.div>
    </motion.button>
  );
};