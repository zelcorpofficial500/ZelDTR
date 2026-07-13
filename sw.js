const CACHE_NAME = 'zel-dtr-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon.png'
];

// Install event listener for the service worker
self.addEventListener('install', (event) => {
  // Extend the lifetime of the service worker until the promise resolves
  event.waitUntil(
    // Open the cache with the specified name
    caches.open(CACHE_NAME).then((cache) => {
      // Add all the assets to the cache
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch event listener for the service worker
self.addEventListener('fetch', (event) => {
  // Respond to the fetch event
  event.respondWith(
    // Check if the requested resource is already in the cache
    caches.match(event.request).then((cachedResponse) => {
      // If the resource is in the cache, return it
      // Otherwise, fetch the resource from the network
      return cachedResponse || fetch(event.request);
    })
  );
});