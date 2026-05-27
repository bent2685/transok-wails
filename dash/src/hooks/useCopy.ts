import { useState } from 'react';

export const useCopy = () => {
  const [isCopying, setIsCopying] = useState(false);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (isCopying) return false;
    
    setIsCopying(true);
    
    try {
      // Prefer modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback: use traditional textarea method
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      return success;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    } finally {
      setIsCopying(false);
    }
  };

  return { copyToClipboard, isCopying };
};