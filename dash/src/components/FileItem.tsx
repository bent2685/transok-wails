import { Download, Copy, Check, Folder } from 'lucide-react';
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
      className="surface-card rounded-lg p-3.5 sm:p-4 cursor-pointer transition-colors hover:border-hairline-strong group flex flex-col items-center text-center relative"
    >
      {/* Primary action — top-right corner; folders enter on card click instead */}
      {!isFolder && (
        <motion.button
          onClick={handleAction}
          disabled={isLoading}
          whileTap={{ scale: 0.92 }}
          className="btn-icon-olive absolute top-2 right-2 !w-8 !h-8 z-10"
          aria-label={isPureText ? `Copy ${file.Name}` : `Download ${file.Name}`}
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
          ) : justDone ? (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            >
              <Check size={14} strokeWidth={2.8} />
            </motion.span>
          ) : isPureText ? (
            <Copy size={13} strokeWidth={2.5} />
          ) : (
            <Download size={13} strokeWidth={2.5} />
          )}
        </motion.button>
      )}

      {/* Large icon tile */}
      <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg border flex items-center justify-center transition-colors ${
        isPureText || isFolder
          ? 'border-olive/30 bg-olive/10'
          : 'border-hairline bg-surface-elevated'
      }`}>
        {isFolder
          ? <Folder size={30} className="text-olive" strokeWidth={2} />
          : getFileIcon(file.Type, 28)}
      </div>

      {/* Name */}
      <h3 className="mt-3 w-full font-semibold text-ink text-[13px] sm:text-[14px] line-clamp-2 break-words leading-snug">
        {file.Name || (isPureText ? 'Untitled snippet' : 'Untitled')}
      </h3>

      {/* Meta */}
      <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted tabular-nums">
        <span className="truncate max-w-full">{displaySize}</span>
        {!isPureText && !isFolder && (
          <>
            <span className="w-1 h-1 rounded-full bg-hairline-strong flex-shrink-0" />
            <span className="uppercase tracking-wider flex-shrink-0">.{(file.Type || 'bin').toLowerCase()}</span>
          </>
        )}
      </div>
    </motion.li>
  );
};
