import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface UploaderProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSize?: number; // 单位: MB
  className?: string;
}

export function Uploader({
  onFileSelect,
  accept = "*",
  maxSize = 50,
  className,
}: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`文件大小不能超过 ${maxSize}MB`);
      return;
    }
    onFileSelect?.(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-42",
        "border-2 border-solid rounded-lg cursor-pointer bg-bg2",
        "transition-colors duration-200",
        isDragging ? "border-primary bg-primary/5" : "border-border",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileInput}
      />

      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <div className="i-tabler:file-upload text-(pri 10)"></div>
        <p className="m-2 text-(3.5 text2)">点击或拖拽上传文件</p>
        <div>
          <Button size="sm" variant="destructive" onClick={handleClick}>
            上传文件
          </Button>
        </div>
      </div>
    </div>
  );
}
