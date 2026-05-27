import { RefreshCw, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="surface-card rounded-lg p-8 sm:p-10 max-w-xl mx-auto"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-11 h-11 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(239, 68, 68, 0.12)' }}
        >
          <AlertOctagon size={20} className="text-rose" strokeWidth={2.2} />
        </div>
        <div className="flex-1 space-y-3">
          <span className="caption-up text-rose">Error · 500</span>
          <h3 className="text-title-lg text-ink" style={{ letterSpacing: '-0.0125em' }}>
            Couldn’t load this share
          </h3>
          <p className="text-body text-sm leading-relaxed">{message}</p>
          {onRetry && (
            <div className="pt-2">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                onClick={onRetry}
                className="btn-primary"
              >
                <RefreshCw size={14} strokeWidth={2.5} />
                <span>Retry</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
