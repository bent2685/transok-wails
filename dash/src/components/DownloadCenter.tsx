import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  X,
  Pause,
  Play,
  Check,
  AlertTriangle,
  DownloadCloud,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { DownloadManager, DownloadSnapshot } from '../services/downloadManager';
import { calcFileSize } from '../utils/fileIcons';

const formatSpeed = (bps: number): string => {
  if (!bps || bps <= 0) return '—';
  return `${calcFileSize(bps)}/s`;
};

const formatEta = (seconds: number): string => {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

export const DownloadCenter = () => {
  const [tasks, setTasks] = useState<DownloadSnapshot[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    return DownloadManager.subscribe(setTasks);
  }, []);

  // 离开页面前若有活动任务，提醒用户（流被中断会让浏览器把下载标记失败）
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (DownloadManager.hasActive()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const visible = tasks;
  const summary = useMemo(() => {
    const active = visible.filter((t) => t.status === 'downloading' || t.status === 'paused' || t.status === 'preparing').length;
    const done = visible.filter((t) => t.status === 'completed').length;
    const failed = visible.filter((t) => t.status === 'error' || t.status === 'canceled').length;
    const legacy = visible.filter((t) => t.status === 'legacy').length;
    return { active, done, failed, legacy, total: visible.length };
  }, [visible]);

  const swUnavailable = !DownloadManager.isSupported();

  if (visible.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="download-center"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[min(92vw,420px)] surface-card rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '70vh' }}
      >
        {/* Header */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-hairline bg-surface-elevated/60 hover:bg-surface-elevated transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#7C7E2C' }}>
              <DownloadCloud size={13} className="text-white" strokeWidth={2.4} />
            </div>
            <div className="text-left min-w-0">
              <div className="text-[13px] font-semibold text-ink leading-tight">Downloads</div>
              <div className="text-[11px] text-muted tabular-nums leading-tight">
                {summary.active > 0
                  ? `${summary.active} in progress`
                  : summary.legacy > 0
                  ? `${summary.legacy} handed to browser`
                  : `${summary.done} completed`}
                {summary.failed > 0 ? ` · ${summary.failed} failed` : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(summary.done > 0 || summary.failed > 0) && (
              <button
                onClick={(e) => { e.stopPropagation(); DownloadManager.clearFinished(); }}
                className="text-[11px] text-muted hover:text-ink px-2 py-1 rounded hover:bg-canvas/60 transition-colors"
                aria-label="Clear finished"
              >
                Clear
              </button>
            )}
            {collapsed ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
          </div>
        </button>

        {/* Task list */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              {swUnavailable && (
                <div className="px-3.5 py-2 text-[11px] leading-snug text-muted border-b border-hairline bg-surface-elevated/40">
                  Insecure origin — app-level progress disabled. Files are delivered by the browser's native download.
                  Serve over HTTPS or via <span className="font-mono text-ink">localhost</span> to enable resumable, controllable downloads.
                </div>
              )}
              <ul className="overflow-y-auto scroll-clean divide-y divide-hairline" style={{ maxHeight: '54vh' }}>
                {visible.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

const TaskRow = ({ task }: { task: DownloadSnapshot }) => {
  const pct = task.size > 0 ? Math.min(100, (task.loaded / task.size) * 100) : 0;
  const remaining = task.size > 0 && task.speed > 0 ? (task.size - task.loaded) / task.speed : Infinity;

  const statusMeta = useMemo(() => {
    switch (task.status) {
      case 'preparing': return { label: 'Preparing', tone: 'muted', icon: <Loader2 size={12} className="animate-spin" /> };
      case 'downloading': return { label: 'Downloading', tone: 'olive', icon: null };
      case 'paused': return { label: 'Paused', tone: 'muted', icon: <Pause size={12} /> };
      case 'completed': return { label: 'Done', tone: 'olive', icon: <Check size={12} strokeWidth={2.8} /> };
      case 'error': return { label: 'Failed', tone: 'rose', icon: <AlertTriangle size={12} /> };
      case 'canceled': return { label: 'Canceled', tone: 'muted', icon: <X size={12} /> };
      case 'legacy': return { label: 'Opened in browser', tone: 'muted', icon: <ExternalLink size={12} /> };
      default: return { label: '', tone: 'muted', icon: null };
    }
  }, [task.status]);

  const isActive = task.status === 'downloading';
  const isPaused = task.status === 'paused';
  const isTerminal = task.status === 'completed' || task.status === 'error' || task.status === 'canceled';

  const toneClass =
    statusMeta.tone === 'olive' ? 'text-olive'
    : statusMeta.tone === 'rose' ? 'text-rose'
    : 'text-muted';

  return (
    <li className="px-3.5 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-semibold text-ink truncate" title={task.filename}>
              {task.filename}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] tabular-nums">
            <span className={`inline-flex items-center gap-1 ${toneClass}`}>
              {statusMeta.icon}
              <span>{statusMeta.label}</span>
            </span>
            <span className="text-muted-soft">·</span>
            <span className="text-muted">
              {task.size > 0
                ? `${calcFileSize(task.loaded)} / ${calcFileSize(task.size)}`
                : calcFileSize(task.loaded)}
            </span>
            {isActive && task.size > 0 && (
              <>
                <span className="text-muted-soft">·</span>
                <span className="text-muted">{formatSpeed(task.speed)}</span>
                <span className="text-muted-soft">·</span>
                <span className="text-muted">{formatEta(remaining)}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isActive && (
            <button
              onClick={() => DownloadManager.pause(task.id)}
              className="w-7 h-7 inline-flex items-center justify-center rounded text-muted hover:text-ink hover:bg-surface-elevated transition-colors"
              aria-label="Pause"
              title="Pause"
            >
              <Pause size={13} strokeWidth={2.4} />
            </button>
          )}
          {isPaused && (
            <button
              onClick={() => DownloadManager.resume(task.id)}
              className="w-7 h-7 inline-flex items-center justify-center rounded text-white transition-colors"
              style={{ background: '#7C7E2C' }}
              aria-label="Resume"
              title="Resume"
            >
              <Play size={13} strokeWidth={2.4} />
            </button>
          )}
          {!isTerminal && task.status !== 'legacy' && (
            <button
              onClick={() => DownloadManager.cancel(task.id)}
              className="w-7 h-7 inline-flex items-center justify-center rounded text-muted hover:text-rose hover:bg-surface-elevated transition-colors"
              aria-label="Cancel"
              title="Cancel"
            >
              <X size={13} strokeWidth={2.4} />
            </button>
          )}
          {isTerminal && (
            <button
              onClick={() => DownloadManager.remove(task.id)}
              className="w-7 h-7 inline-flex items-center justify-center rounded text-muted hover:text-ink hover:bg-surface-elevated transition-colors"
              aria-label="Remove"
              title="Remove"
            >
              <Trash2 size={12} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(task.size > 0 || task.status === 'preparing') && (
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
          {task.status === 'preparing' ? (
            <div className="h-full w-1/3 animate-pulse" style={{ background: '#7C7E2C' }} />
          ) : (
            <motion.div
              className="h-full rounded-full"
              style={{
                background: task.status === 'error' || task.status === 'canceled' ? '#ef4444' : '#7C7E2C',
                opacity: isPaused ? 0.45 : 1,
              }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.25, ease: 'linear' }}
            />
          )}
        </div>
      )}

      {task.status === 'error' && task.error && (
        <div className="mt-1 text-[11px] text-rose truncate" title={task.error}>{task.error}</div>
      )}
    </li>
  );
};
