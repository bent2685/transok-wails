// transok dash — Service Worker that turns a page-side ReadableStream
// into a browser-native file download (Content-Disposition: attachment).
//
// 工作流：
//   1) 页面侧 new TransformStream()，把 readable 通过 postMessage(transfer) 给 SW
//      并附上 {id, filename, size}
//   2) SW 把 readable 存入 streams Map，回复 {url} 给页面
//   3) 页面用 hidden iframe 导航到该 url → 浏览器命中 SW fetch → SW 返回
//      带 Content-Disposition: attachment 的 Response(readable)
//   4) 浏览器立刻弹出下载条，边读边落盘
//   5) 页面侧持续向 writable 写入 Range 拉到的字节，完成后 writer.close()
//
// 该机制可对超大文件做到「秒弹下载条 + 应用级进度控制」。

const STREAMS = new Map();
const PATH_PREFIX = '__sw-download/';
// 注册超时（毫秒）：若 iframe 一直没来取流，SW 会自行清理避免泄漏
const REGISTRATION_TTL = 60 * 1000;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'PING') {
    event.source && event.source.postMessage({ type: 'PONG' });
    return;
  }

  if (msg.type === 'REGISTER_DOWNLOAD') {
    const { id, filename, size, readable } = msg;
    if (!id || !readable) return;
    const expireAt = Date.now() + REGISTRATION_TTL;
    STREAMS.set(id, { readable, filename: filename || 'download', size, expireAt });

    // 主动 GC：过期未被取走的流释放掉
    setTimeout(() => {
      const entry = STREAMS.get(id);
      if (entry && entry.expireAt <= Date.now()) {
        STREAMS.delete(id);
        try { entry.readable.cancel('expired').catch(() => {}); } catch (_) {}
      }
    }, REGISTRATION_TTL + 500);

    const scope = self.registration.scope.endsWith('/') ? self.registration.scope : self.registration.scope + '/';
    const url = `${scope}${PATH_PREFIX}${encodeURIComponent(id)}`;
    if (event.source) {
      event.source.postMessage({ type: 'DOWNLOAD_READY', id, url });
    }
    return;
  }

  if (msg.type === 'CANCEL_DOWNLOAD') {
    const entry = STREAMS.get(msg.id);
    if (entry) {
      STREAMS.delete(msg.id);
      try { entry.readable.cancel('canceled').catch(() => {}); } catch (_) {}
    }
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const idx = url.pathname.indexOf(PATH_PREFIX);
  if (idx === -1) return;

  const id = decodeURIComponent(url.pathname.slice(idx + PATH_PREFIX.length));
  const entry = STREAMS.get(id);
  if (!entry) return; // 让浏览器返回 404

  STREAMS.delete(id);

  const headers = new Headers({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(entry.filename)}`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (typeof entry.size === 'number' && entry.size >= 0) {
    headers.set('Content-Length', String(entry.size));
  }

  event.respondWith(new Response(entry.readable, { status: 200, headers }));
});
