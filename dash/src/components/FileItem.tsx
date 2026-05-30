import { Download, Copy, Check, ChevronRight, Folder } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileItem as FileItemType } from '../types';
import { getFileIcon, calcFileSize } from '../utils/fileIcons';

interface FileItemProps {
  file: FileItemType;
  index: number;
  onDownload: (file: FileItemType) => void;
  onCopy: (text: string) => void;
  onOpen: (file: FileItemType) => void;
}

export const FileItem = ({ file, index, onDownload, onCopy, onOpen }: FileItemProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [justDone, setJustDone] = useState(false);
  const isPureText = file.Type === 'pure-text';
  const isFolder = file.Type === 'folder';

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isPureText) await onCopy(file.Text || '');
      else await onDownload(file);
      setJustDone(true);
      setTimeout(() => setJustDone(false), 1400);
    } finally {
      setIsLoading(false);
    }
  };

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
      className="surface-card rounded-lg px-3.5 sm:px-4 py-3 sm:py-3.5 cursor-pointer transition-all hover:border-hairline-strong group"
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Icon tile */}
        <div className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-md border flex items-center justify-center transition-colors ${
          isPureText || isFolder
            ? 'border-olive/30 bg-olive/10'
            : 'border-hairline bg-surface-elevated'
        }`}>
          {isFolder ? <Folder size={18} className="text-olive" strokeWidth={2.2} /> : getFileIcon(file.Type)}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink text-[14px] sm:text-[15px] truncate">
            {file.Name || (isPureText ? 'Untitled snippet' : 'Untitled')}
          </h3>

          {/* Text preview — up to 2 lines, newlines preserved */}
          {isPureText && file.Text && (
            <p className="mt-0.5 font-mono text-[12px] text-muted line-clamp-2">
              {file.Text}
            </p>
          )}

          {!isPureText && file.Note && (
            <p className="mt-0.5 text-[12px] text-muted line-clamp-1 italic">
              {file.Note}
            </p>
          )}

          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted tabular-nums">
            <span>{displaySize}</span>
            {!isPureText && !isFolder && (
              <>
                <span className="w-1 h-1 rounded-full bg-hairline-strong" />
                <span className="uppercase tracking-wider">.{(file.Type || 'bin').toLowerCase()}</span>
              </>
            )}
          </div>
        </div>

        {/* Primary action — folders have no inline action, the row click enters */}
        {!isFolder && (
          <motion.button
            onClick={handleAction}
            disabled={isLoading}
            whileTap={{ scale: 0.92 }}
            className="btn-icon-olive flex-shrink-0 !w-10 !h-10 sm:!w-11 sm:!h-11 relative"
            aria-label={isPureText ? `Copy ${file.Name}` : `Download ${file.Name}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
            ) : justDone ? (
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              >
                <Check size={16} strokeWidth={2.8} />
              </motion.span>
            ) : isPureText ? (
              <Copy size={15} strokeWidth={2.5} />
            ) : (
              <Download size={15} strokeWidth={2.5} />
            )}
          </motion.button>
        )}

        <ChevronRight size={16} className="flex-shrink-0 text-muted-soft group-hover:text-muted transition-colors" />
      </div>
    </motion.li>
  );
};
