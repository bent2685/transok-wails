import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待动画完成
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 
                  flex items-center space-x-2.5 px-3 py-2 rounded-lg backdrop-blur-xl
                  linear-border transition-all duration-400 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95'
                  } ${
                    type === 'success'
                      ? 'bg-green-50/80 dark:bg-green-900/10 text-green-700 dark:text-green-300'
                      : 'bg-red-50/80 dark:bg-red-900/10 text-red-700 dark:text-red-300'
                  }`}
    >
      {type === 'success' ? (
        <CheckCircle size={14} />
      ) : (
        <XCircle size={14} />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={handleClose}
        className="ml-1 hover:opacity-60 transition-opacity duration-200"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// Toast 管理 Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
  }>>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
};