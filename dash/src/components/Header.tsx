import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  totalFiles: number;
}

export const Header = ({ title, totalFiles }: HeaderProps) => {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div className="space-y-1.5">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="caption-up text-muted"
        >
          share manifest
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl sm:text-3xl font-bold text-ink"
          style={{ letterSpacing: '-0.025em' }}
        >
          {title}
          <span className="text-olive">.</span>
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="flex items-baseline gap-2"
      >
        <span className="text-3xl sm:text-4xl font-bold tabular-nums text-olive" style={{ letterSpacing: '-0.02em' }}>
          {totalFiles}
        </span>
        <span className="caption-up text-muted">
          {totalFiles === 1 ? 'item' : 'items'}
        </span>
      </motion.div>
    </div>
  );
};
