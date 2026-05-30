import { 
  FileText, 
  Download, 
  FileImage, 
  Smartphone, 
  HardDrive,
  File,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Presentation,
  Keyboard
} from 'lucide-react';

export const getFileIcon = (type: string, size: number = 18) => {
  const iconProps = { size, strokeWidth: 2, className: "text-olive" };

  switch (type.toLowerCase()) {
    // 图片类型
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'bmp':
      return <FileImage {...iconProps} />;
    
    // 文档类型
    case 'pdf':
      return <FileText {...iconProps} />;
    case 'doc':
    case 'docx':
      return <FileText {...iconProps} />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet {...iconProps} />;
    case 'ppt':
    case 'pptx':
      return <Presentation {...iconProps} />;
    case 'txt':
    case 'md':
      return <FileText {...iconProps} />;
    
    // 压缩文件
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'iso':
      return <FileArchive {...iconProps} />;
    
    // 代码文件
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
    case 'json':
    case 'yaml':
    case 'toml':
      return <FileCode {...iconProps} />;
    
    // 应用程序
    case 'dmg':
      return <HardDrive {...iconProps} />;
    case 'exe':
      return <Download {...iconProps} />;
    case 'apk':
      return <Smartphone {...iconProps} />;
    case 'ipa':
      return <Smartphone {...iconProps} />;
    
    // 纯文本
    case 'pure-text':
      return <Keyboard {...iconProps} />;
    
    default:
      return <File {...iconProps} />;
  }
};

export const calcFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size}B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
};