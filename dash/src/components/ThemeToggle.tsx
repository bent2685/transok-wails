import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const Icon = theme === 'system' ? Monitor : actualTheme === 'light' ? Moon : Sun;

  const label =
    theme === 'system'
      ? 'Switch to light mode'
      : theme === 'light'
      ? 'Switch to dark mode'
      : 'Switch to system mode';

  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileTap={{ scale: 0.92 }}
      className="w-9 h-9 inline-flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-surface-elevated transition-colors"
      aria-label={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <Icon size={15} strokeWidth={2.2} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};
