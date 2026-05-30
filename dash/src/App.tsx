import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Github, Search, X, DownloadCloud, Inbox, Folder, ChevronRight, Archive, FolderOpen } from 'lucide-react';
import { FileItem } from './components/FileItem';
import { Header } from './components/Header';
import { ThemeToggle } from './components/ThemeToggle';
import { Loading } from './components/Loading';
import { ErrorMessage } from './components/ErrorMessage';
import { CaptchaModal } from './components/CaptchaModal';
import { DetailDialog } from './components/DetailDialog';
import { DownloadCenter } from './components/DownloadCenter';
import { useToast } from './components/Toast';
import { useCopy } from './hooks/useCopy';
import { ApiService } from './services/api';
import { FileItem as FileItemType, ShareData, BrowseData, BrowseEntry } from './types';
import { calcFileSize, isImage, getFileIcon } from './utils/fileIcons';

type Filter = 'all' | 'folder' | 'file' | 'text';

function App() {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // 浏览态：进入某个共享文件夹后由 URL hash 驱动（#folder=<id>&sub=<rel>）
  const [browse, setBrowse] = useState<{ folderId: string; sub: string } | null>(null);
  const [browseData, setBrowseData] = useState<BrowseData | null>(null);
  const [browseLoading, setBrowseLoading] = useState(false);

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
      await ApiService.downloadFile(file.Path, file.Name);
      showToast('Added to downloads', 'success');
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
    const files = shareData.shareList.filter((f) => f.Type !== 'pure-text' && f.Type !== 'folder');
    if (files.length === 0) {
      showToast('No files to download', 'error');
      return;
    }
    showToast(`Added ${files.length} files to downloads`, 'success');
    for (const f of files) {
      try {
        await ApiService.downloadFile(f.Path, f.Name);
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

  // URL hash 同步：详情 #item=<path>；浏览 #folder=<id>&sub=<rel>
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash;
      const item = hash.match(/item=([^&]+)/);
      setSelectedPath(item ? decodeURIComponent(item[1]) : null);

      const folder = hash.match(/folder=([^&]+)/);
      if (folder) {
        const sub = hash.match(/sub=([^&]+)/);
        setBrowse({
          folderId: decodeURIComponent(folder[1]),
          sub: sub ? decodeURIComponent(sub[1]) : '',
        });
      } else {
        setBrowse(null);
      }
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  // 浏览态变化 → 实时拉取目录内容
  useEffect(() => {
    if (!browse) {
      setBrowseData(null);
      return;
    }
    let canceled = false;
    setBrowseLoading(true);
    ApiService.browse(browse.folderId, browse.sub)
      .then((data) => {
        if (!canceled) setBrowseData(data);
      })
      .catch((err) => {
        if (canceled) return;
        showToast(err instanceof Error ? err.message : 'Folder not accessible', 'error');
        // 出错退回分享清单
        history.replaceState(null, '', window.location.pathname + window.location.search);
        setBrowse(null);
        setBrowseData(null);
      })
      .finally(() => {
        if (!canceled) setBrowseLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [browse]);

  const openItem = (file: FileItemType) => {
    if (file.Type === 'folder') {
      if (!file.Id) return;
      window.location.hash = `folder=${encodeURIComponent(file.Id)}`;
      return;
    }
    const key = file.Id || file.Path;
    if (!key) return;
    window.location.hash = `item=${encodeURIComponent(key)}`;
  };

  // 浏览态内导航：进入子目录 / 跳到面包屑某一级 / 退回分享清单
  const navigateSub = (sub: string) => {
    if (!browse) return;
    const base = `folder=${encodeURIComponent(browse.folderId)}`;
    window.location.hash = sub ? `${base}&sub=${encodeURIComponent(sub)}` : base;
  };

  const exitBrowse = () => {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setBrowse(null);
    setBrowseData(null);
  };

  const handleBrowseEntryDownload = (entry: BrowseEntry) => {
    if (!browse) return;
    ApiService.downloadFile(entry.relPath, entry.name, {
      folderId: browse.folderId,
      sub: entry.relPath,
    })
      .then(() => showToast('Added to downloads', 'success'))
      .catch((err) => showToast(err instanceof Error ? err.message : 'Download failed', 'error'));
  };

  const downloadZip = () => {
    if (!browse) return;
    const url = ApiService.buildZipUrl(browse.folderId, browse.sub);
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const closeDetail = () => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setSelectedPath(null);
  };

  const buildInlineUrl = (file: FileItemType) => {
    const captcha = localStorage.getItem('captcha');
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    let url = `${base}/download/index?inline=1&filePath=${encodeURIComponent(file.Path)}`;
    if (captcha) url += `&captcha-key=${encodeURIComponent(captcha)}`;
    return url;
  };

  const total = shareData?.shareList.length ?? 0;
  const textCount = shareData?.shareList.filter((f) => f.Type === 'pure-text').length ?? 0;
  const folderCount = shareData?.shareList.filter((f) => f.Type === 'folder').length ?? 0;
  const fileCount = total - textCount - folderCount;

  // 当前共享文件夹的根名（面包屑根），从分享清单按 id 取
  const browseRootName = useMemo(() => {
    if (!browse || !shareData) return '';
    return shareData.shareList.find((f) => f.Id === browse.folderId)?.Name ?? '';
  }, [browse, shareData]);

  // 面包屑：根 + sub 各段，可点跳任意一级
  const crumbs = useMemo(() => {
    if (!browse) return [] as { label: string; sub: string }[];
    const list = [{ label: browseRootName || 'Folder', sub: '' }];
    if (browse.sub) {
      const parts = browse.sub.split('/').filter(Boolean);
      let acc = '';
      for (const p of parts) {
        acc = acc ? `${acc}/${p}` : p;
        list.push({ label: p, sub: acc });
      }
    }
    return list;
  }, [browse, browseRootName]);

  // 浏览态搜索：仅本地过滤当前目录条目
  const visibleEntries = useMemo(() => {
    if (!browseData) return [] as BrowseEntry[];
    const q = query.trim().toLowerCase();
    if (!q) return browseData.entries;
    return browseData.entries.filter((e) => e.name.toLowerCase().includes(q));
  }, [browseData, query]);

  const selectedFile = useMemo(() => {
    if (!selectedPath || !shareData) return null;
    return (
      shareData.shareList.find((f) => f.Id === selectedPath) ??
      shareData.shareList.find((f) => f.Path === selectedPath) ??
      null
    );
  }, [selectedPath, shareData]);

  const visibleList = useMemo(() => {
    if (!shareData) return [];
    const q = query.trim().toLowerCase();
    return shareData.shareList.filter((f) => {
      if (filter === 'folder' && f.Type !== 'folder') return false;
      if (filter === 'file' && (f.Type === 'pure-text' || f.Type === 'folder')) return false;
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

          {/* Toolbar — search + filter/breadcrumb + bulk action; sticky inside the scroll */}
          {!isLoading && !error && shareData && (browse || total > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="mt-6 sm:mt-7 sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-canvas/95 backdrop-blur-sm border-b border-hairline"
            >
              {/* Breadcrumb — only while browsing a shared folder */}
              {browse && (
                <div className="flex items-center gap-1 flex-wrap mb-2.5 text-[13px]">
                  <button
                    onClick={exitBrowse}
                    className="inline-flex items-center gap-1 text-muted hover:text-ink transition-colors"
                  >
                    <FolderOpen size={14} strokeWidth={2.2} />
                    <span>Shared</span>
                  </button>
                  {crumbs.map((c, i) => (
                    <span key={c.sub} className="inline-flex items-center gap-1">
                      <ChevronRight size={13} className="text-muted-soft" />
                      <button
                        onClick={() => navigateSub(c.sub)}
                        className={`transition-colors ${
                          i === crumbs.length - 1 ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {c.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}

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
                    placeholder={browse ? 'Search in this folder…' : 'Search name, text, or extension…'}
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

                {browse ? (
                  /* Browse mode — zip the current directory */
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={downloadZip}
                    className="btn-primary !h-10 !px-3.5 text-[13px]"
                    aria-label="Download folder as zip"
                  >
                    <Archive size={14} strokeWidth={2.5} />
                    <span className="hidden sm:inline">Download .zip</span>
                  </motion.button>
                ) : (
                  <>
                    {/* Filter chips */}
                    <div className="flex items-center gap-1 p-1 rounded-md bg-surface-elevated border border-hairline">
                      <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} count={total}>
                        All
                      </FilterChip>
                      <FilterChip
                        active={filter === 'folder'}
                        onClick={() => setFilter('folder')}
                        count={folderCount}
                        disabled={folderCount === 0}
                      >
                        Folders
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
                  </>
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

              {browse && !isLoading && !error && (
                <motion.div
                  key="browse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {browseLoading ? (
                    <div className="min-h-[200px] flex items-center justify-center">
                      <Loading />
                    </div>
                  ) : visibleEntries.length === 0 ? (
                    <div className="surface-card rounded-lg py-12 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-10 h-10 rounded-md bg-surface-elevated border border-hairline flex items-center justify-center mb-3">
                        <Folder size={18} className="text-muted" strokeWidth={2} />
                      </div>
                      <p className="text-sm font-semibold text-ink">
                        {query ? 'No matches' : 'Empty folder'}
                      </p>
                    </div>
                  ) : (
                    <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-1.5">
                      {visibleEntries.map((entry, index) => (
                        <BrowseItem
                          key={entry.relPath}
                          entry={entry}
                          index={index}
                          folderId={browse.folderId}
                          onEnter={() => navigateSub(entry.relPath)}
                          onDownload={() => handleBrowseEntryDownload(entry)}
                        />
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}

              {shareData && !browse && !isLoading && !error && (
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
                    <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-1.5">
                      {visibleList.map((file, index) => (
                        <FileItem
                          key={`${file.Name}-${index}`}
                          file={file}
                          index={index}
                          onOpen={openItem}
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

      <DetailDialog
        file={selectedFile}
        onClose={closeDetail}
        onDownload={handleDownload}
        onCopy={handleCopy}
        buildInlineUrl={buildInlineUrl}
      />

      <DownloadCenter />
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

const BrowseItem = ({
  entry,
  index,
  folderId,
  onEnter,
  onDownload,
}: {
  entry: BrowseEntry;
  index: number;
  folderId: string;
  onEnter: () => void;
  onDownload: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const ext = entry.name.includes('.') ? entry.name.split('.').pop()! : '';
  const showThumb = !entry.isDir && isImage(ext) && !thumbFailed;

  const runDownload = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onDownload();
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  // 整个格子可点：目录进入、文件下载
  const handleClick = () => {
    if (entry.isDir) {
      onEnter();
      return;
    }
    runDownload();
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.025, 0.25), ease: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      className="group rounded-lg p-2 cursor-pointer transition-colors hover:bg-surface-card flex flex-col items-center text-center relative"
    >
      {/* Icon / thumbnail */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
        {showThumb ? (
          <img
            src={ApiService.buildFolderInlineUrl(folderId, entry.relPath)}
            alt={entry.name}
            loading="lazy"
            onError={() => setThumbFailed(true)}
            className="w-full h-full object-cover rounded-md border border-hairline bg-surface-elevated"
            style={{ imageOrientation: 'from-image' }}
          />
        ) : entry.isDir ? (
          <Folder size={50} className="text-olive" strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
        ) : (
          getFileIcon(ext || 'other', 46)
        )}

        {/* Inline status badge while downloading */}
        {!entry.isDir && isLoading && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-olive flex items-center justify-center border border-canvas">
            <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="mt-1.5 w-full font-medium text-ink text-[12px] line-clamp-2 break-words leading-snug">
        {entry.name}
      </h3>

      {/* Meta */}
      <div className="mt-0.5 text-[11px] text-muted tabular-nums">
        {entry.isDir ? 'Folder' : calcFileSize(entry.size)}
      </div>
    </motion.li>
  );
};

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
