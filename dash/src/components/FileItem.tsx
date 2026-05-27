import { Download, Copy } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileItem as FileItemType } from "../types";
import { getFileIcon, calcFileSize } from "../utils/fileIcons";

interface FileItemProps {
  file: FileItemType;
  onDownload: (file: FileItemType) => void;
  onCopy: (text: string) => void;
}

export const FileItem = ({ file, onDownload, onCopy }: FileItemProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isPureText = file.Type === "pure-text";

  const handleAction = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isPureText) {
        await onCopy(file.Text || "");
      } else {
        await onDownload(file);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displaySize = isPureText
    ? file.Text
      ? `${file.Text.length} characters`
      : "No content"
    : calcFileSize(file.Size);

  return (
    <motion.div
      whileHover={{ scale: 1.005, y: -1 }}
      whileTap={{ scale: 0.995 }}
      className={`clean-card px-4 sm:px-4 lg:px-5 py-3.5 sm:py-3 rounded-lg group cursor-pointer transition-all duration-200 ${
        isPureText && file.Text ? "pb-4 sm:pb-4" : ""
      }`}
      onClick={handleAction}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <motion.div
            whileHover={{ rotate: 5 }}
            className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
          >
            {getFileIcon(file.Type)}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <h3 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 truncate">
                {file.Name || "Untitled"}
              </h3>
              {isPureText && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden sm:inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-200/50 dark:border-primary-700/50"
                >
                  Text
                </motion.span>
              )}
            </div>

            {/* 显示文本内容（仅纯文本类型） */}
            {isPureText && file.Text && (
              <div className="mt-1.5 sm:mt-2 pr-2">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 selectable">
                  {file.Text}
                </p>
              </div>
            )}

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
              {displaySize}
            </p>
          </div>
        </div>

        {/* Action button - always visible */}
        <div className="flex items-center">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="clean-button p-2 sm:p-2.5 rounded-lg text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              isPureText ? `Copy ${file.Name}` : `Download ${file.Name}`
            }
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPureText ? (
              <Copy size={14} className="sm:w-4 sm:h-4" />
            ) : (
              <Download size={14} className="sm:w-4 sm:h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
