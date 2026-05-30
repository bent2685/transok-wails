import { useState } from 'react';
import { Folder, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import { FileItem as FileItemType } from '../types';
import { getFileIcon, calcFileSize, isImage } from '../utils/fileIcons';
import { ApiService } from '../services/api';

interface FileItemProps {
  file: FileItemType;
  index: number;
  onOpen: (file: FileItemType) => void;
}

export const FileItem = ({ file, index, onOpen }: FileItemProps) => {
  const isPureText = file.Type === 'pure-text';
  const isFolder = file.Type === 'folder';
  const [thumbFailed, setThumbFailed] = useState(false);
  const showThumb = !isFolder && !isPureText && isImage(file.Type) && !thumbFailed;

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
      className="group rounded-lg p-2 cursor-pointer transition-colors hover:bg-surface-card flex flex-col items-center text-center relative"
    >
      {/* Icon / thumbnail */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
        {showThumb ? (
          <img
            src={ApiService.buildInlineUrl(file.Path)}
            alt={file.Name}
            loading="lazy"
            onError={() => setThumbFailed(true)}
            className="w-full h-full object-cover rounded-md border border-hairline bg-surface-elevated"
            style={{ imageOrientation: 'from-image' }}
          />
        ) : isFolder ? (
          <Folder size={50} className="text-olive" strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
        ) : (
          getFileIcon(file.Type, 46)
        )}

        {/* Note badge */}
        {!!file.Note && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-olive flex items-center justify-center border border-canvas" title={file.Note}>
            <StickyNote size={9} strokeWidth={2.5} className="text-white" />
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="mt-1.5 w-full font-medium text-ink text-[12px] line-clamp-2 break-words leading-snug">
        {file.Name || (isPureText ? 'Untitled snippet' : 'Untitled')}
      </h3>

      {/* Meta */}
      <div className="mt-0.5 text-[11px] text-muted tabular-nums truncate max-w-full">
        {displaySize}
      </div>
    </motion.li>
  );
};
