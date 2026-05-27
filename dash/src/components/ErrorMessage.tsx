import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 px-4"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl clean-card flex items-center justify-center"
      >
        <AlertCircle size={20} className="sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
      </motion.div>
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
          Something went wrong
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-sm sm:max-w-md">
          {message}
        </p>
      </div>
      {onRetry && (
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base font-medium
                     clean-button rounded-lg text-gray-700 dark:text-gray-200"
        >
          <RefreshCw size={14} className="sm:w-4 sm:h-4" />
          <span>Try again</span>
        </motion.button>
      )}
    </motion.div>
  );
};