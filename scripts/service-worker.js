/* VERSION and ASSETS are injected by scripts/pwa.mjs from the exported build. */
const CACHE = `lumni-offline-${VERSION}`;
const ROOT = '/';
const assetPaths = new Set(ASSETS);
let networkOnline = true;
async function broadcast(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach((client) => client.postMessage(message));
}
async function appResponse(response) {
  if (!response || !response.ok || response.redirected || response.type !== 'basic') return false;
  if (!(response.headers.get('content-type') || '').includes('text/html')) return false;
  return (await response.clone().text()).includes('data-lumni-app="true"');
}
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      let index = 0,
        completed = 0;
      try {
        const results = await Promise.allSettled(
          Array.from({ length: 4 }, async () => {
            while (index < ASSETS.length) {
              const path = ASSETS[index++];
              const response = await fetch(
                new Request(path, { cache: 'reload', credentials: 'same-origin' }),
              );
              if (
                !response.ok ||
                response.redirected ||
                response.type !== 'basic' ||
                (path === ROOT && !(await appResponse(response)))
              )
                throw new Error('The app could not be downloaded completely.');
              await cache.put(path, response);
              completed++;
              if (completed % 10 === 0 || completed === ASSETS.length)
                await broadcast({ type: 'OFFLINE_PROGRESS', completed, total: ASSETS.length });
            }
          }),
        );
        if (results.some((result) => result.status === 'rejected'))
          throw new Error('Incomplete offline download.');
        await broadcast({ type: 'OFFLINE_READY', version: VERSION });
      } catch (error) {
        // A failed update must never replace the last complete offline version.
        await caches.delete(CACHE);
        await broadcast({ type: 'OFFLINE_ERROR' });
        throw error;
      }
    })(),
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Keep one prior complete build for another tab that still has its older JavaScript open.
      const prior = keys.filter((key) => key.startsWith('lumni-offline-') && key !== CACHE);
      await Promise.all(prior.slice(0, -1).map((key) => caches.delete(key)));
      await self.clients.claim();
      await broadcast({ type: 'OFFLINE_READY', version: VERSION });
    })(),
  );
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
  if (event.data?.type === 'OFFLINE_STATUS') {
    event.waitUntil(
      (async () => {
        const ready = await caches.has(CACHE);
        event.source?.postMessage({ type: 'NETWORK_STATUS', online: networkOnline });
        event.source?.postMessage({
          type: ready ? 'OFFLINE_READY' : 'OFFLINE_ERROR',
          version: VERSION,
        });
      })(),
    );
  }
});
async function navigation(request) {
  const url = new URL(request.url);
  const isRoot = url.pathname === '/' || url.pathname === '/index.html';
  const cache = await caches.open(CACHE);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    networkOnline = true;
    await broadcast({ type: 'NETWORK_STATUS', online: true });
    // Authentication gates, errors and redirects never overwrite the app shell.
    if (isRoot && !url.search && (await appResponse(response)))
      await cache.put(ROOT, response.clone());
    if (response.ok || response.status < 500) return response;
  } catch {
    /* Continue with the complete offline shell. */
  } finally {
    clearTimeout(timeout);
  }
  networkOnline = false;
  await broadcast({ type: 'NETWORK_STATUS', online: false });
  return (
    (isRoot && (await cache.match(ROOT))) ||
    (await cache.match('/offline.html')) ||
    Response.error()
  );
}
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(navigation(request));
    return;
  }
  // Only assets named in this build are eligible. API, auth and external requests pass through.
  if (url.search || (!assetPaths.has(url.pathname) && !url.pathname.startsWith('/_next/static/')))
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const saved =
        (await cache.match(url.pathname)) ||
        (url.pathname.startsWith('/_next/static/') && (await caches.match(url.pathname)));
      if (saved) return saved;
      return fetch(request);
    })(),
  );
});
