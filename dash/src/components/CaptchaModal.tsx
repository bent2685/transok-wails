import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';

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
      setTimeout(() => inputRefs.current[0]?.focus(), 120);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...captcha];
    next[index] = value;
    setCaptcha(next);
    if (value && index < 4) inputRefs.current[index + 1]?.focus();
    if (next.every((d) => d !== '') && index === 4) handleSubmit(next.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !captcha[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && captcha.every((d) => d !== '')) {
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

  const filled = captcha.every((d) => d !== '');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md surface-card rounded-lg overflow-hidden"
          >
            {/* Olive header band */}
            <div className="olive-band px-6 py-5 sm:px-7 sm:py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-white/10 border border-white/15 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-white" strokeWidth={2.4} />
                </div>
                <div>
                  <p className="caption-up text-white/70">Access · Step 1</p>
                  <p className="text-white text-base font-semibold" style={{ letterSpacing: '-0.01em' }}>
                    Verification required
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-md text-white/80 hover:bg-white/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className="px-6 py-6 sm:px-7 sm:py-7 space-y-6">
              <p className="text-body text-sm leading-relaxed">
                Enter the <span className="text-ink font-semibold">5-digit code</span> shared with this link. The share is unlocked once the code matches.
              </p>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="text-input font-mono text-center !h-14 text-lg sm:text-xl !p-0 !px-1"
                    disabled={isSubmitting}
                  />
                ))}
              </div>

              <motion.button
                onClick={() => handleSubmit(captcha.join(''))}
                disabled={!filled || isSubmitting}
                whileHover={filled ? { y: -1 } : undefined}
                whileTap={filled ? { y: 0 } : undefined}
                className="btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <span>Unlock share</span>
                )}
              </motion.button>

              <p className="caption-up text-muted text-center">
                end-to-end · single-use
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
