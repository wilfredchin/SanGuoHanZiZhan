const CACHE = 'sanguozhi-v6-r4';
const BASE = 'https://wilfredchin.github.io/SanGuoHanZiZhan/';
const FILES = [
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  // Chapter story illustrations — pre-cached so they work offline
  // even before the user has opened each chapter for the first time
  BASE + 'c1_Peach_Garden_Oath.webp',
  BASE + 'c2_Chain_Stratagem.webp',
  BASE + 'c3_Three_Visits.webp',
  BASE + 'c4_Straw_Boat_Arrows.webp',
  BASE + 'c5_Red_Cliff_Fire.webp',
  BASE + 'c6_Five_Passes_Six_Generals.webp',
  BASE + 'c7_Battle_of_Changban.webp',
  BASE + 'c8_Zhao_Yun_Rescues.webp',
  BASE + 'c9_Scraping_the_Bone.webp',
  BASE + 'c10_Flooding_Seven_Armies.webp',
  BASE + 'c11_Seven_Captures.webp',
  BASE + 'c13_Memorial.webp',
  BASE + 'c14_Empty_City.webp',
  BASE + 'c15_Sima_Prevails.webp',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(FILES.map(f =>
        cache.add(f).catch(err => console.warn('[SW] Could not cache:', f, err))
      ))
    ).then(() => self.skipWaiting())
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
  if (!e.request.url.startsWith(BASE)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(BASE + 'index.html'));
    })
  );
});
