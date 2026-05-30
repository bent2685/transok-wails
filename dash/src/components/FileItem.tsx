import { Check, Folder } from 'lucide-react';
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

  // 整个格子可点：文件夹进入、纯文本复制、文件下载
  const handleClick = () => {
    if (isFolder) {
      onOpen(file);
      return;
    }
    handleAction({ stopPropagation: () => {} } as React.MouseEvent);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.025, 0.25),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={handleClick}
      className="group rounded-lg p-2.5 sm:p-3 cursor-pointer transition-colors hover:bg-surface-card flex flex-col items-center text-center relative"
    >
      {/* Large filled icon — no surrounding card */}
      <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] flex items-center justify-center">
        {isFolder ? (
          <Folder size={56} className="text-olive" strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
        ) : (
          getFileIcon(file.Type, 52)
        )}

        {/* Inline status badge on the icon corner while acting */}
        {!isFolder && (isLoading || justDone) && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-olive flex items-center justify-center">
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={12} strokeWidth={3} className="text-white" />
            )}
          </span>
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
