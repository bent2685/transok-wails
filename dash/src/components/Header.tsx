import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  totalFiles: number;
}

export const Header = ({ title, totalFiles }: HeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between min-h-[2.5rem] sm:min-h-[3rem]">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight leading-tight">
            {title}
          </h1>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full flex-shrink-0"
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex items-center space-x-1 text-sm sm:text-base flex-shrink-0 h-full"
        >
          <span className="text-gray-700 dark:text-gray-200 font-semibold tabular-nums leading-none">{totalFiles}</span>
          <span className="text-gray-500 dark:text-gray-400 hidden xs:inline sm:inline leading-none">files</span>
        </motion.div>
      </div>
    </motion.div>
  );
};