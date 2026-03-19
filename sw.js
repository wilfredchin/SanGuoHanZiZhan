const CACHE = 'sanguozhi-v6-r1';

// All files needed to run offline
const FILES = [
  './sanguozhi_v6.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// On install: cache everything immediately
self.addEventListener('install', e => {
  console.log('[SW] Installing and caching...');
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => {
        console.log('[SW] All files cached');
        return self.skipWaiting(); // activate immediately
      })
  );
});

// On activate: delete old caches and take control immediately
self.addEventListener('activate', e => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim()) // control all open tabs now
  );
});

// On fetch: serve from cache first, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) {
          return cached; // serve from cache
        }
        return fetch(e.request) // try network
          .then(response => {
            // Cache any new successful responses
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE).then(cache => cache.put(e.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Network failed and not in cache — return the main HTML as fallback
            return caches.match('./sanguozhi_v6.html');
          });
      })
  );
});
