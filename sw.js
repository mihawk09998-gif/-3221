/**
 * САМОР - PROGRESSIVE WEB APP SERVICE WORKER
 * Caches core assets to enable offline menu viewing and fast startup speeds.
 */

const CACHE_NAME = 'samor-pwa-cache-v12';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './menu-data.js',
  './config.js',
  './manifest.json',
  './images/logo.jpeg',
  './images/logo-white.jpeg'
];

// Install Event - Caches initial assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clears old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate caching strategy
self.addEventListener('fetch', event => {
  // Pass non-GET requests through (like Telegram Bot POST requests)
  if (event.request.method !== 'GET') return;

  // Do not cache API endpoints (always load fresh database)
  if (event.request.url.includes('/api/')) return;

  // Do not intercept Chrome extensions or foreign API calls
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache, fetch update in background
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {/* Ignore network errors while offline */});
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
            return networkResponse;
          });
      })
  );
});
