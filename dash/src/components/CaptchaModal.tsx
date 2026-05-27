import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';

interface CaptchaModalProps {
  isOpen: boolean;
  onSubmit: (captcha: string) => void;
  onClose: () => void;
}

export const CaptchaModal = ({ isOpen, onSubmit, onClose }: CaptchaModalProps) => {
  const [captcha, setCaptcha] = useState(['', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCaptcha(['', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCaptcha = [...captcha];
    newCaptcha[index] = value;
    setCaptcha(newCaptcha);

    // Auto focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all fields are filled
    if (newCaptcha.every(digit => digit !== '') && index === 4) {
      handleSubmit(newCaptcha.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !captcha[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && captcha.every(digit => digit !== '')) {
      handleSubmit(captcha.join(''));
    }
  };

  const handleSubmit = async (code: string) => {
    setIsSubmitting(true);
    try {
      await onSubmit(code);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative w-full max-w-sm sm:max-w-md clean-card rounded-xl p-6 sm:p-8"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg clean-button text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center"
              >
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Enter Verification Code
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 px-2">
                Please enter the 5-digit verification code to continue
              </p>
            </div>

            {/* Input fields */}
            <div className="flex justify-center space-x-2 sm:space-x-3 mb-6 sm:mb-8">
              {captcha.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-base sm:text-lg font-semibold clean-input rounded-lg focus:outline-none transition-all duration-200"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            {/* Submit button */}
            <motion.button
              onClick={() => handleSubmit(captcha.join(''))}
              disabled={!captcha.every(digit => digit !== '') || isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 clean-button rounded-lg font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Code'
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};