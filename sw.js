const CACHE_NAME = 'zel-dtr-v3'; // Incrementing this forces a brand new cache layer
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Force immediate activation of the new worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.log("Asset caching skipped: ", err));
    })
  );
});

// Clean up old caches and kill stuck loops
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old system cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy: Always check the internet first to avoid Google Drive errors
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If internet is working, update the cache copy in background
        if (networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Only return cached version if user is completely offline
        return caches.match(event.request);
      })
  );
});
