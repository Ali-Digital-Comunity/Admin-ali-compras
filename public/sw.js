const SW_VERSION = 'admin-sao-jorge-pwa-v1';
const APP_CACHE = `${SW_VERSION}-app`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-192x192.png',
  '/icons/maskable-512x512.png',
];

const isSameOriginGet = (request) =>
  request.method === 'GET' && new URL(request.url).origin === self.location.origin;

const isNavigationRequest = (request) =>
  request.mode === 'navigate' ||
  (request.headers.get('accept') || '').includes('text/html');

const getBuildAssetsFromHtml = (html) => {
  const assetUrls = new Set();
  const assetPattern = /(?:src|href)="([^"]+\.(?:css|js|png|svg|webp|ico|woff2?))"/g;
  let match = assetPattern.exec(html);

  while (match) {
    const assetUrl = match[1];

    if (assetUrl.startsWith('/')) {
      assetUrls.add(assetUrl);
    }

    match = assetPattern.exec(html);
  }

  return [...assetUrls];
};

const precacheApp = async () => {
  const cache = await caches.open(APP_CACHE);

  await cache.addAll(APP_SHELL);

  try {
    const response = await fetch('/index.html', { cache: 'no-store' });

    if (!response.ok) {
      return;
    }

    await cache.put('/index.html', response.clone());

    const html = await response.text();
    const buildAssets = getBuildAssetsFromHtml(html);

    if (buildAssets.length > 0) {
      await cache.addAll(buildAssets);
    }
  } catch (error) {
    console.warn('Build assets could not be precached:', error);
  }
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }

  return response;
};

const networkFirstNavigation = async (request) => {
  const cache = await caches.open(APP_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put('/index.html', response.clone());
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return (
      (await caches.match(request)) ||
      (await caches.match('/index.html')) ||
      (await caches.match('/offline.html')) ||
      Response.error()
    );
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(precacheApp().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== APP_CACHE && key !== RUNTIME_CACHE)
              .map((key) => caches.delete(key)),
          ),
        ),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!isSameOriginGet(request)) {
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
