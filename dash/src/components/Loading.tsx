import { motion } from 'framer-motion';

export const Loading = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center space-y-4"
    >
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 rounded-full"
        />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-base text-gray-600 dark:text-gray-300 font-medium"
      >
        Loading files...
      </motion.p>
    </motion.div>
  );
};