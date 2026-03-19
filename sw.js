const CACHE = 'sanguozhi-v6-r2';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      const BASE = self.registration.scope;
      // Cache each file individually so one failure doesn't abort everything
      const files = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
      return Promise.all(
        files.map(f =>
          cache.add(BASE + f).catch(err => console.warn('[SW] Could not cache:', f, err))
        )
      );
    }).then(() => {
      console.log('[SW] Install complete');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.registration.scope)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(self.registration.scope + 'index.html'));
    })
  );
});
