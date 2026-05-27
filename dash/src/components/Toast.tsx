import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 250);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="surface-card rounded-md px-3.5 py-2.5 flex items-center gap-3 max-w-md"
        >
          <span
            className="w-1 self-stretch rounded-sm"
            style={{ background: isSuccess ? '#7C7E2C' : '#ef4444' }}
          />
          {isSuccess ? (
            <CheckCircle2 size={16} className="text-olive flex-shrink-0" strokeWidth={2.4} />
          ) : (
            <AlertTriangle size={16} className="text-rose flex-shrink-0" strokeWidth={2.4} />
          )}
          <span className="text-sm font-medium text-ink truncate">{message}</span>
          <button
            onClick={handleClose}
            className="ml-2 text-muted hover:text-ink"
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((p) => [...p, { id, message, type }]);
  };

  const removeToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  const ToastContainer = () => (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );

  return { showToast, ToastContainer };
};
