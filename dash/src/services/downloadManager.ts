// transok dash — 企业级大文件下载管理器
//
// 设计要点：
//  · 通过 Service Worker 把页面侧的 ReadableStream 转成浏览器原生附件下载，
//    点击即弹下载条，不再受限于浏览器内置的等待/缓冲。
//  · N 路并发 HTTP Range 拉分片，按序写入 SW stream → 带宽吃满 + 内存可控。
//  · 应用级 暂停 / 继续 / 取消，进度、速率、ETA 全在 UI 侧渲染。
//  · 不安全上下文（裸 HTTP LAN 分享）SW 不可用时，自动降级为原生 <a> 下载。

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB / chunk
const CONCURRENCY = 4;
const SPEED_WINDOW_MS = 3000;
const SW_FILE = 'download-sw.js';
const SW_PATH_HINT = '/download/page/';

export type DownloadStatus =
  | 'preparing'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'error'
  | 'canceled'
  | 'legacy';

export interface DownloadSnapshot {
  id: string;
  filename: string;
  filePath: string;
  size: number; // -1 表示未知（legacy fallback）
  loaded: number;
  speed: number; // bytes/sec
  status: DownloadStatus;
  error?: string;
  startedAt: number;
  mode: 'sw' | 'legacy';
}

interface InternalTask extends DownloadSnapshot {
  // 仅内部使用
  abortAll: AbortController[];
  writer: WritableStreamDefaultWriter<Uint8Array> | null;
  iframe: HTMLIFrameElement | null;
  nextChunk: number;
  nextWrite: number;
  buffered: Map<number, Uint8Array>;
  totalChunks: number;
  pauseGate: Promise<void> | null;
  pauseResolve: (() => void) | null;
  speedSamples: { t: number; bytes: number }[];
  workersRunning: number;
  finishResolve: (() => void) | null;
}

type Listener = (tasks: DownloadSnapshot[]) => void;

class DownloadManagerImpl {
  private baseUrl = '';
  private getCaptcha: () => string | null = () => null;
  private sw: ServiceWorker | null = null;
  private swReady: Promise<boolean> | null = null;
  private supported = false;
  private tasks = new Map<string, InternalTask>();
  private listeners = new Set<Listener>();

  configure(opts: { baseUrl: string; getCaptcha: () => string | null }) {
    this.baseUrl = opts.baseUrl || '';
    this.getCaptcha = opts.getCaptcha;
  }

  /** 在 main.tsx 启动时调用：注册 SW、探测能力 */
  async init() {
    if (typeof window === 'undefined') return;
    if (this.swReady) return this.swReady;

    this.swReady = (async () => {
      if (!('serviceWorker' in navigator)) return false;
      if (!window.isSecureContext) return false; // SW 强制 HTTPS / localhost
      if (typeof TransformStream === 'undefined') return false;

      try {
        // 当页面以 /download/page/ 提供时，SW 也走相同路径；
        // 兼容 vite dev 服务器（根路径）。
        const swUrl = this.resolveSwUrl();
        const reg = await navigator.serviceWorker.register(swUrl, {
          scope: this.resolveSwScope(),
        });
        await navigator.serviceWorker.ready;
        this.sw = reg.active || navigator.serviceWorker.controller;
        if (!navigator.serviceWorker.controller) {
          // 首次注册需要刷新一次才会接管；保留一次自动 reload 机会，避免用户感知
          await new Promise<void>((res) => {
            const onCtrlChange = () => {
              navigator.serviceWorker.removeEventListener('controllerchange', onCtrlChange);
              res();
            };
            navigator.serviceWorker.addEventListener('controllerchange', onCtrlChange);
            // 兜底：1.5s 后强制继续
            setTimeout(res, 1500);
          });
          this.sw = navigator.serviceWorker.controller || this.sw;
        }
        this.supported = !!this.sw;
        return this.supported;
      } catch (e) {
        console.warn('[transok] download SW unavailable, fallback to legacy mode:', e);
        return false;
      }
    })();

    return this.swReady;
  }

  private resolveSwUrl(): string {
    const path = window.location.pathname;
    // 生产：/download/page/index.html → /download/page/download-sw.js
    if (path.includes(SW_PATH_HINT)) return `${SW_PATH_HINT}${SW_FILE}`;
    // 开发 / 预览：站点根
    return `/${SW_FILE}`;
  }

  private resolveSwScope(): string {
    const path = window.location.pathname;
    if (path.includes(SW_PATH_HINT)) return SW_PATH_HINT;
    return '/';
  }

  isSupported(): boolean {
    return this.supported;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((l) => {
      try { l(snap); } catch (_) {}
    });
  }

  snapshot(): DownloadSnapshot[] {
    return Array.from(this.tasks.values()).map((t) => ({
      id: t.id,
      filename: t.filename,
      filePath: t.filePath,
      size: t.size,
      loaded: t.loaded,
      speed: t.speed,
      status: t.status,
      error: t.error,
      startedAt: t.startedAt,
      mode: t.mode,
    }));
  }

  /** 入口：发起一个下载任务 */
  async enqueue(filePath: string, filename?: string): Promise<string> {
    await this.init();

    const id = `dl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const name = filename || filePath.split(/[\\/]/).pop() || 'download';

    const task: InternalTask = {
      id,
      filename: name,
      filePath,
      size: -1,
      loaded: 0,
      speed: 0,
      status: 'preparing',
      startedAt: Date.now(),
      mode: this.supported ? 'sw' : 'legacy',
      abortAll: [],
      writer: null,
      iframe: null,
      nextChunk: 0,
      nextWrite: 0,
      buffered: new Map(),
      totalChunks: 0,
      pauseGate: null,
      pauseResolve: null,
      speedSamples: [],
      workersRunning: 0,
      finishResolve: null,
    };
    this.tasks.set(id, task);
    this.emit();

    if (task.mode === 'legacy') {
      this.runLegacy(task);
      return id;
    }

    this.runSw(task).catch((e) => {
      task.status = 'error';
      task.error = e?.message || String(e);
      this.cleanupTask(task);
      this.emit();
    });
    return id;
  }

  pause(id: string) {
    const t = this.tasks.get(id);
    if (!t || t.mode === 'legacy') return;
    if (t.status !== 'downloading') return;
    t.status = 'paused';
    t.pauseGate = new Promise<void>((res) => { t.pauseResolve = res; });
    t.speed = 0;
    t.speedSamples = [];
    this.emit();
  }

  resume(id: string) {
    const t = this.tasks.get(id);
    if (!t || t.mode === 'legacy') return;
    if (t.status !== 'paused') return;
    t.status = 'downloading';
    const r = t.pauseResolve;
    t.pauseResolve = null;
    t.pauseGate = null;
    r && r();
    this.emit();
  }

  cancel(id: string) {
    const t = this.tasks.get(id);
    if (!t) return;
    if (t.status === 'completed' || t.status === 'error' || t.status === 'canceled') {
      this.tasks.delete(id);
      this.emit();
      return;
    }
    t.status = 'canceled';
    // 解除 pause gate（避免 worker 永远阻塞）
    if (t.pauseResolve) { t.pauseResolve(); t.pauseResolve = null; t.pauseGate = null; }
    t.abortAll.forEach((c) => { try { c.abort(); } catch (_) {} });
    if (t.writer) {
      try { t.writer.abort('canceled by user'); } catch (_) {}
    }
    if (this.sw) {
      try { this.sw.postMessage({ type: 'CANCEL_DOWNLOAD', id: t.id }); } catch (_) {}
    }
    this.cleanupTask(t);
    this.emit();
  }

  /** 移除终态任务（completed / error / canceled） */
  remove(id: string) {
    const t = this.tasks.get(id);
    if (!t) return;
    if (t.status === 'downloading' || t.status === 'paused' || t.status === 'preparing') {
      this.cancel(id);
      return;
    }
    this.tasks.delete(id);
    this.emit();
  }

  clearFinished() {
    for (const [id, t] of this.tasks) {
      if (t.status === 'completed' || t.status === 'error' || t.status === 'canceled' || t.status === 'legacy') {
        this.tasks.delete(id);
      }
    }
    this.emit();
  }

  hasActive(): boolean {
    for (const t of this.tasks.values()) {
      if (t.status === 'downloading' || t.status === 'paused' || t.status === 'preparing') return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Legacy fallback：直接交给浏览器原生下载（无进度，记录为提示项）
  // ---------------------------------------------------------------------------
  private runLegacy(task: InternalTask) {
    const url = this.buildDownloadUrl(task.filePath);
    const a = document.createElement('a');
    a.href = url;
    a.download = task.filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    task.status = 'legacy';
    this.emit();
    // 8s 后自动移除提示，给用户足够时间看到「已交给浏览器」状态
    setTimeout(() => {
      if (this.tasks.get(task.id)?.status === 'legacy') {
        this.tasks.delete(task.id);
        this.emit();
      }
    }, 8000);
  }

  // ---------------------------------------------------------------------------
  // Service Worker 路径：HEAD 探尺寸 → 注册 stream → 触发下载 → 并发分片
  // ---------------------------------------------------------------------------
  private async runSw(task: InternalTask) {
    // 1) HEAD 拿尺寸
    const url = this.buildDownloadUrl(task.filePath);
    const headResp = await fetch(url, { method: 'HEAD' });
    if (!headResp.ok) {
      throw new Error(`HEAD failed: HTTP ${headResp.status}`);
    }
    const lenHeader = headResp.headers.get('Content-Length');
    const size = lenHeader ? parseInt(lenHeader, 10) : -1;
    if (!Number.isFinite(size) || size < 0) {
      throw new Error('Server did not return Content-Length');
    }
    const acceptRanges = headResp.headers.get('Accept-Ranges');
    const supportsRange = !acceptRanges || acceptRanges.toLowerCase().includes('bytes');

    task.size = size;
    task.totalChunks = Math.max(1, Math.ceil(size / CHUNK_SIZE));
    this.emit();

    // 2) 构造 TransformStream，把 readable 通过 transfer 交给 SW
    const ts = new TransformStream<Uint8Array, Uint8Array>();
    task.writer = ts.writable.getWriter();

    const registered = await this.registerWithSw(task.id, task.filename, size, ts.readable);
    if (!registered) {
      task.writer = null;
      throw new Error('Failed to register stream with Service Worker');
    }

    // 3) 隐藏 iframe 触发下载（让浏览器去消费 SW Response）
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = registered.url;
    document.body.appendChild(iframe);
    task.iframe = iframe;

    task.status = 'downloading';
    this.emit();

    // 4) 启动并发 workers
    if (!supportsRange || size === 0) {
      // 后端没声明支持 Range，退化为单连接顺序拉
      await this.singleStreamWorker(task, url);
    } else {
      const finishPromise = new Promise<void>((res) => { task.finishResolve = res; });
      const conc = Math.min(CONCURRENCY, task.totalChunks);
      for (let i = 0; i < conc; i++) this.spawnWorker(task, url);
      await finishPromise;
    }

    if (isCanceled(task)) return;

    // 5) 收尾
    try { await task.writer.close(); } catch (_) {}
    task.status = 'completed';
    task.speed = 0;
    this.cleanupTask(task, { keepIframe: true });
    // iframe 留一会儿确保浏览器把最后字节落盘
    setTimeout(() => { try { task.iframe?.remove(); } catch (_) {} task.iframe = null; }, 1500);
    this.emit();
  }

  private async registerWithSw(
    id: string,
    filename: string,
    size: number,
    readable: ReadableStream<Uint8Array>
  ): Promise<{ url: string } | null> {
    if (!this.sw) this.sw = navigator.serviceWorker.controller;
    if (!this.sw) return null;

    return new Promise((resolve) => {
      const onMessage = (ev: MessageEvent) => {
        const m = ev.data;
        if (m && m.type === 'DOWNLOAD_READY' && m.id === id) {
          navigator.serviceWorker.removeEventListener('message', onMessage);
          resolve({ url: m.url });
        }
      };
      navigator.serviceWorker.addEventListener('message', onMessage);
      try {
        this.sw!.postMessage(
          { type: 'REGISTER_DOWNLOAD', id, filename, size, readable },
          [readable as unknown as Transferable]
        );
      } catch (e) {
        navigator.serviceWorker.removeEventListener('message', onMessage);
        console.warn('[transok] transferable stream not supported:', e);
        resolve(null);
        return;
      }
      // 兜底超时
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', onMessage);
        resolve(null);
      }, 3000);
    });
  }

  /** 单连接流式拉（不支持 Range 时使用） */
  private async singleStreamWorker(task: InternalTask, url: string) {
    const ctrl = new AbortController();
    task.abortAll.push(ctrl);
    const resp = await fetch(url, { signal: ctrl.signal });
    if (!resp.ok || !resp.body) throw new Error(`GET failed: HTTP ${resp.status}`);
    const reader = resp.body.getReader();
    while (true) {
      // 处理暂停
      if (task.pauseGate) await task.pauseGate;
      if (isCanceled(task)) return;
      const { value, done } = await reader.read();
      if (done) break;
      if (value && task.writer) {
        await task.writer.write(value);
        this.onBytes(task, value.byteLength);
      }
    }
  }

  private spawnWorker(task: InternalTask, url: string) {
    task.workersRunning++;
    (async () => {
      try {
        while (true) {
          if (isCanceled(task)) break;
          if (task.pauseGate) await task.pauseGate;

          const idx = task.nextChunk;
          if (idx >= task.totalChunks) break;
          task.nextChunk = idx + 1;

          const start = idx * CHUNK_SIZE;
          const end = Math.min(task.size, start + CHUNK_SIZE) - 1;

          // 简单的内存背压：缓冲超过 CONCURRENCY*2 块时等待 drain
          while (task.buffered.size >= CONCURRENCY * 2) {
            await sleep(20);
            if (isCanceled(task)) return;
          }

          const ctrl = new AbortController();
          task.abortAll.push(ctrl);
          let bytes: Uint8Array;
          try {
            bytes = await this.fetchRange(url, start, end, ctrl.signal);
          } catch (e: any) {
            if (isCanceled(task)) return;
            // 单片失败重试 2 次
            let ok = false;
            for (let attempt = 0; attempt < 2 && !ok; attempt++) {
              await sleep(400 * (attempt + 1));
              if (isCanceled(task)) return;
              try {
                bytes = await this.fetchRange(url, start, end, new AbortController().signal);
                ok = true;
              } catch (_) {}
            }
            if (!ok) throw e;
            // @ts-ignore
            if (!bytes) throw e;
          } finally {
            const i = task.abortAll.indexOf(ctrl);
            if (i >= 0) task.abortAll.splice(i, 1);
          }

          task.buffered.set(idx, bytes!);
          await this.drainOrdered(task);
        }
      } catch (e: any) {
        if (task.status !== 'canceled') {
          task.status = 'error';
          task.error = e?.message || String(e);
          try { task.writer?.abort(e); } catch (_) {}
          this.emit();
        }
      } finally {
        task.workersRunning--;
        if (task.workersRunning === 0) {
          task.finishResolve?.();
        }
      }
    })();
  }

  private async drainOrdered(task: InternalTask) {
    while (task.buffered.has(task.nextWrite)) {
      if (isCanceled(task)) return;
      const buf = task.buffered.get(task.nextWrite)!;
      task.buffered.delete(task.nextWrite);
      task.nextWrite++;
      if (!task.writer) return;
      await task.writer.write(buf);
      this.onBytes(task, buf.byteLength);
    }
  }

  private async fetchRange(url: string, start: number, end: number, signal: AbortSignal): Promise<Uint8Array> {
    const resp = await fetch(url, {
      method: 'GET',
      headers: { Range: `bytes=${start}-${end}` },
      signal,
    });
    if (!(resp.status === 206 || resp.status === 200)) {
      throw new Error(`Range fetch failed: HTTP ${resp.status}`);
    }
    const buf = await resp.arrayBuffer();
    return new Uint8Array(buf);
  }

  private onBytes(task: InternalTask, n: number) {
    task.loaded += n;
    const now = Date.now();
    task.speedSamples.push({ t: now, bytes: n });
    const cutoff = now - SPEED_WINDOW_MS;
    while (task.speedSamples.length && task.speedSamples[0].t < cutoff) task.speedSamples.shift();
    const total = task.speedSamples.reduce((s, x) => s + x.bytes, 0);
    const span = Math.max(1, now - (task.speedSamples[0]?.t ?? now));
    task.speed = (total / span) * 1000;
    this.emit();
  }

  private cleanupTask(task: InternalTask, opts: { keepIframe?: boolean } = {}) {
    task.buffered.clear();
    task.abortAll = [];
    if (!opts.keepIframe && task.iframe) {
      try { task.iframe.remove(); } catch (_) {}
      task.iframe = null;
    }
    task.writer = null;
  }

  private buildDownloadUrl(filePath: string): string {
    const captcha = this.getCaptcha();
    let url = `${this.baseUrl}/download/index?filePath=${encodeURIComponent(filePath)}`;
    if (captcha) url += `&captcha-key=${encodeURIComponent(captcha)}`;
    return url;
  }
}

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }
// status 字段在 await 期间会被外部 mutate；用辅助函数避开 TS 控制流收窄
const isCanceled = (t: InternalTask) => (t.status as DownloadStatus) === 'canceled';

export const DownloadManager = new DownloadManagerImpl();
