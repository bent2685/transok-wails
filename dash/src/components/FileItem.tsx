import { Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { FileItem as FileItemType } from '../types';
import { getFileIcon, calcFileSize } from '../utils/fileIcons';

interface FileItemProps {
  file: FileItemType;
  index: number;
  onOpen: (file: FileItemType) => void;
}

export const FileItem = ({ file, index, onOpen }: FileItemProps) => {
  const isPureText = file.Type === 'pure-text';
  const isFolder = file.Type === 'folder';

  const displaySize = isFolder
    ? 'Folder'
    : isPureText
    ? file.Text
      ? `${file.Text.length} chars`
      : 'empty'
    : calcFileSize(file.Size);

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.025, 0.25),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() => onOpen(file)}
      className="group rounded-lg p-2.5 sm:p-3 cursor-pointer transition-colors hover:bg-surface-card flex flex-col items-center text-center relative"
    >
      {/* Large filled icon — no surrounding card */}
      <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] flex items-center justify-center">
        {isFolder ? (
          <Folder size={56} className="text-olive" strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
        ) : (
          getFileIcon(file.Type, 52)
        )}
      </div>

      {/* Name */}
      <h3 className="mt-2 w-full font-medium text-ink text-[12px] sm:text-[13px] line-clamp-2 break-words leading-snug">
        {file.Name || (isPureText ? 'Untitled snippet' : 'Untitled')}
      </h3>

      {/* Meta */}
      <div className="mt-0.5 text-[11px] text-muted tabular-nums truncate max-w-full">
        {displaySize}
      </div>
    </motion.li>
  );
};
