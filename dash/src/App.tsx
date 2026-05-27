import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Github, FileText, Search, X, DownloadCloud, Inbox } from 'lucide-react';
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

type Filter = 'all' | 'file' | 'text';

function App() {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { showToast, ToastContainer } = useToast();
  const { copyToClipboard } = useCopy();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const shouldCaptcha = await ApiService.shouldCaptcha();
      if (shouldCaptcha) {
        const url = new URL(window.location.href);
        const captchaInUrl = url.searchParams.get('captcha');
        if (!captchaInUrl) {
          setShowCaptchaModal(true);
          return;
        }
        ApiService.initializeCaptcha();
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
      showToast(err instanceof Error ? err.message : 'Download failed', 'error');
    }
  };

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    showToast(ok ? 'Copied to clipboard' : 'Copy failed', ok ? 'success' : 'error');
  };

  const handleDownloadAll = async () => {
    if (!shareData) return;
    const files = shareData.shareList.filter((f) => f.Type !== 'pure-text');
    if (files.length === 0) {
      showToast('No files to download', 'error');
      return;
    }
    showToast(`Starting ${files.length} downloads`, 'success');
    for (const f of files) {
      try {
        await ApiService.downloadFile(f.Path);
      } catch {
        // single failure should not abort batch
      }
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
    ApiService.initializeCaptcha();
    const t = setTimeout(loadData, 250);
    return () => clearTimeout(t);
  }, []);

  const total = shareData?.shareList.length ?? 0;
  const textCount = shareData?.shareList.filter((f) => f.Type === 'pure-text').length ?? 0;
  const fileCount = total - textCount;

  const visibleList = useMemo(() => {
    if (!shareData) return [];
    const q = query.trim().toLowerCase();
    return shareData.shareList.filter((f) => {
      if (filter === 'file' && f.Type === 'pure-text') return false;
      if (filter === 'text' && f.Type !== 'pure-text') return false;
      if (!q) return true;
      return (
        (f.Name || '').toLowerCase().includes(q) ||
        (f.Text || '').toLowerCase().includes(q) ||
        (f.Type || '').toLowerCase().includes(q)
      );
    });
  }, [shareData, query, filter]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ToastContainer />
      <CaptchaModal
        isOpen={showCaptchaModal}
        onSubmit={handleCaptchaSubmit}
        onClose={handleCaptchaClose}
      />

      {/* Top nav — 56px, tight */}
      <header className="flex-shrink-0 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{ background: '#7C7E2C' }}>
              <Database size={12} className="text-white" strokeWidth={2.6} />
            </div>
            <span className="font-bold text-ink text-[14px] tracking-tight">transok</span>
            <span className="hidden sm:inline-flex caption-up text-muted ml-1.5">share</span>
          </motion.div>

          <div className="flex items-center gap-1.5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 inline-flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-surface-elevated transition-colors"
              aria-label="GitHub"
            >
              <Github size={15} strokeWidth={2.2} />
            </a>
            <ThemeToggleCompact />
          </div>
        </div>
      </header>

      {/* Main scroll area */}
      <main className="flex-1 overflow-y-auto scroll-clean">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
          {/* Compact hero — title + total stat inline */}
          <Header title="Transok" totalFiles={total} />

          {/* Toolbar — search + filter + bulk action; sticky inside the scroll */}
          {!isLoading && !error && shareData && total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="mt-6 sm:mt-7 sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-canvas/95 backdrop-blur-sm border-b border-hairline"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={14}
                    strokeWidth={2.2}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search name, text, or extension…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-input !h-10 !pl-9 !pr-9 text-sm"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center rounded text-muted hover:text-ink hover:bg-surface-elevated"
                      aria-label="Clear search"
                    >
                      <X size={12} strokeWidth={2.4} />
                    </button>
                  )}
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1 p-1 rounded-md bg-surface-elevated border border-hairline">
                  <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} count={total}>
                    All
                  </FilterChip>
                  <FilterChip
                    active={filter === 'file'}
                    onClick={() => setFilter('file')}
                    count={fileCount}
                    disabled={fileCount === 0}
                  >
                    Files
                  </FilterChip>
                  <FilterChip
                    active={filter === 'text'}
                    onClick={() => setFilter('text')}
                    count={textCount}
                    disabled={textCount === 0}
                  >
                    Text
                  </FilterChip>
                </div>

                {/* Bulk download */}
                {fileCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleDownloadAll}
                    className="btn-primary !h-10 !px-3.5 text-[13px]"
                    aria-label="Download all files"
                  >
                    <DownloadCloud size={14} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Download all</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className="mt-5 sm:mt-6">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[300px] flex items-center justify-center"
                >
                  <Loading />
                </motion.div>
              )}

              {error && !isLoading && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <ErrorMessage message={error} onRetry={loadData} />
                </motion.div>
              )}

              {shareData && !isLoading && !error && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {total === 0 ? (
                    <EmptyState />
                  ) : visibleList.length === 0 ? (
                    <NoMatchState onClear={() => { setQuery(''); setFilter('all'); }} />
                  ) : (
                    <ul className="space-y-2.5 sm:space-y-3">
                      {visibleList.map((file, index) => (
                        <FileItem
                          key={`${file.Name}-${index}`}
                          file={file}
                          index={index}
                          onDownload={handleDownload}
                          onCopy={handleCopy}
                        />
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

const FilterChip = ({
  active,
  onClick,
  count,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      active
        ? 'bg-canvas text-ink shadow-sm'
        : 'text-muted hover:text-ink'
    }`}
  >
    <span>{children}</span>
    <span className={`tabular-nums text-[11px] ${active ? 'text-olive' : 'text-muted-soft'}`}>
      {count}
    </span>
  </button>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="surface-card rounded-lg py-14 sm:py-16 flex flex-col items-center justify-center text-center px-6"
  >
    <div className="w-12 h-12 rounded-md bg-surface-elevated border border-hairline flex items-center justify-center mb-4">
      <Inbox size={20} className="text-muted" strokeWidth={1.8} />
    </div>
    <p className="text-base font-semibold text-ink">Nothing shared yet</p>
    <p className="text-body text-sm mt-1 max-w-sm">
      Items pushed to this link will appear here automatically.
    </p>
  </motion.div>
);

const NoMatchState = ({ onClear }: { onClear: () => void }) => (
  <div className="surface-card rounded-lg py-10 flex flex-col items-center justify-center text-center px-6">
    <div className="w-10 h-10 rounded-md bg-surface-elevated border border-hairline flex items-center justify-center mb-3">
      <Search size={16} className="text-muted" strokeWidth={2} />
    </div>
    <p className="text-sm font-semibold text-ink">No matches</p>
    <p className="text-body text-xs mt-1">Try a different keyword or clear filters.</p>
    <button onClick={onClear} className="mt-4 text-[12px] font-semibold text-olive hover:underline">
      Reset
    </button>
  </div>
);

// inline minimal theme toggle (smaller than 40px btn-icon)
const ThemeToggleCompact = () => {
  return (
    <div className="contents">
      <ThemeToggle />
    </div>
  );
};

export default App;
