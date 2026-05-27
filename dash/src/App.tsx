import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileItem } from './components/FileItem';
import { Header } from './components/Header';
import { ThemeToggle } from './components/ThemeToggle';
import { Loading } from './components/Loading';
import { ErrorMessage } from './components/ErrorMessage';
import { CaptchaModal } from './components/CaptchaModal';
import { useToast } from './components/Toast';
import { useCopy } from './hooks/useCopy';
import { ApiService } from './services/api';
import { FileItem as FileItemType, ShareData } from './types';

function App() {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  
  const { showToast, ToastContainer } = useToast();
  const { copyToClipboard } = useCopy();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 检查是否需要验证码
      const shouldCaptcha = await ApiService.shouldCaptcha();
      
      if (shouldCaptcha) {
        // 从 URL 获取验证码或提示用户输入
        const url = new URL(window.location.href);
        const captchaInUrl = url.searchParams.get('captcha');
        
        if (!captchaInUrl) {
          setShowCaptchaModal(true);
          return;
        } else {
          ApiService.initializeCaptcha();
        }
      }

      const data = await ApiService.getShareList();
      setShareData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Loading failed';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: FileItemType) => {
    try {
      await ApiService.downloadFile(file.Path);
      showToast('Download started', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      showToast(message, 'error');
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast('Copied to clipboard', 'success');
    } else {
      showToast('Copy failed, please copy manually', 'error');
    }
  };

  const handleCaptchaSubmit = async (captcha: string) => {
    try {
      localStorage.setItem('captcha', captcha);
      setShowCaptchaModal(false);
      setIsLoading(true);
      setError(null);
      
      const data = await ApiService.getShareList();
      setShareData(data);
      showToast('Verification successful', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaClose = () => {
    setShowCaptchaModal(false);
    setError('Verification required to access files');
  };

  useEffect(() => {
    // 初始化验证码
    ApiService.initializeCaptcha();
    
    // 延迟加载以显示平滑的进入动画
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col transition-colors duration-500">
      <ThemeToggle />
      <ToastContainer />
      <CaptchaModal 
        isOpen={showCaptchaModal}
        onSubmit={handleCaptchaSubmit}
        onClose={handleCaptchaClose}
      />
      
      {/* Header - Fixed */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-shrink-0 border-b border-gray-200/60 dark:border-gray-700/60 clean-card rounded-none"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
          <div className="pr-11 xs:pr-14 sm:pr-16 lg:pr-8">
            <Header 
              title="Transok"
              totalFiles={shareData?.shareList.length || 0}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <Loading />
              </motion.div>
            )}
            
            {error && !isLoading && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex items-center justify-center"
              >
                <ErrorMessage 
                  message={error}
                  onRetry={loadData}
                />
              </motion.div>
            )}
            
            {shareData && !isLoading && !error && (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full flex flex-col py-3 sm:py-4 lg:py-6"
              >
                {shareData.shareList.length > 0 ? (
                  <div className="flex-1 overflow-y-auto scrollbar-clean">
                    <div className="space-y-2 sm:space-y-2 pr-1 sm:pr-2">
                      {shareData.shareList.map((file, index) => (
                        <motion.div 
                          key={`${file.Name}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: index * 0.05,
                            duration: 0.4,
                            ease: "easeOut"
                          }}
                        >
                          <FileItem 
                            file={file}
                            onDownload={handleDownload}
                            onCopy={handleCopy}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl clean-card flex items-center justify-center"
                      >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </motion.div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">No files available</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Files will appear here when shared</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App;