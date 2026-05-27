import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, FileText } from 'lucide-react';
import { FileItem as FileItemType } from '../types';
import { getFileIcon, calcFileSize } from '../utils/fileIcons';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif'];

interface DetailDialogProps {
  file: FileItemType | null;
  onClose: () => void;
  onDownload: (file: FileItemType) => void;
  onCopy: (text: string) => void;
  buildInlineUrl: (file: FileItemType) => string;
}

export const DetailDialog = ({ file, onClose, onDownload, onCopy, buildInlineUrl }: DetailDialogProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [file, onClose]);

  useEffect(() => {
    setCopied(false);
  }, [file?.Path]);

  const isPureText = file?.Type === 'pure-text';
  const isImage = !!file && IMAGE_EXTS.includes((file.Type || '').toLowerCase());

  const handleCopy = async () => {
    if (!file) return;
    await onCopy(isPureText ? (file.Text || '') : file.Name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ y: '8%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '6%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:w-[min(720px,92vw)] max-h-[88vh] sm:max-h-[80vh] bg-canvas border-t sm:border border-hairline rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-hairline">
              <div className={`flex-shrink-0 w-10 h-10 rounded-md border flex items-center justify-center ${
                isPureText ? 'border-olive/30 bg-olive/10' : 'border-hairline bg-surface-elevated'
              }`}>
                {getFileIcon(file.Type)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-ink text-[15px] truncate">
                  {file.Name || (isPureText ? 'Untitled snippet' : 'Untitled')}
                </h2>
                <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted tabular-nums">
                  <span>
                    {isPureText
                      ? `${(file.Text || '').length} chars`
                      : calcFileSize(file.Size)}
                  </span>
                  {!isPureText && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-hairline-strong" />
                      <span className="uppercase tracking-wider">.{(file.Type || 'bin').toLowerCase()}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="btn-icon !w-9 !h-9 flex-shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto scroll-clean p-4 sm:p-5">
              {!isPureText && file.Note && (
                <div className="mb-4 rounded-md border border-hairline bg-surface-soft px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-wider text-muted-soft mb-1">Note</div>
                  <p className="text-[13px] text-body whitespace-pre-wrap break-words selectable">
                    {file.Note}
                  </p>
                </div>
              )}
              {isPureText ? (
                <pre className="font-mono text-[13px] leading-relaxed text-body whitespace-pre-wrap break-words selectable">
                  {file.Text || <span className="text-muted-soft">empty</span>}
                </pre>
              ) : isImage ? (
                <div className="flex items-center justify-center">
                  <img
                    src={buildInlineUrl(file)}
                    alt={file.Name}
                    className="max-w-full max-h-[60vh] rounded-md border border-hairline object-contain bg-surface-soft"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-lg border border-hairline bg-surface-card flex items-center justify-center mb-3">
                    <FileText size={24} className="text-muted" />
                  </div>
                  <p className="text-[13px] text-muted">No inline preview for this file type</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-4 sm:px-5 py-3 border-t border-hairline bg-surface-soft/60">
              {isPureText ? (
                <button onClick={handleCopy} className="btn-primary !h-10 !px-4 text-[13px]">
                  {copied ? <Check size={14} strokeWidth={2.8} /> : <Copy size={14} strokeWidth={2.5} />}
                  <span>{copied ? 'Copied' : 'Copy text'}</span>
                </button>
              ) : (
                <>
                  <button onClick={handleCopy} className="btn-secondary !h-10 !px-3.5 text-[13px]">
                    {copied ? <Check size={14} strokeWidth={2.8} /> : <Copy size={14} strokeWidth={2.5} />}
                    <span>{copied ? 'Copied' : 'Copy name'}</span>
                  </button>
                  <button onClick={() => onDownload(file)} className="btn-primary !h-10 !px-4 text-[13px]">
                    <Download size={14} strokeWidth={2.5} />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
