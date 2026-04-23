const APP_CACHE = 'sanguozhi-app-v7-r1';
const RUNTIME_CACHE = 'sanguozhi-runtime-v7-r1';
const EXTERNAL_CACHE = 'sanguozhi-external-v7-r1';
const SCOPE_URL = new URL(self.registration.scope);
const EXTERNAL_ORIGINS = new Set([
  'https://cdnjs.cloudflare.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]);

const LOCAL_FILES = [
  './',
  './index.html',
  './sw.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './mainscreen.mp3',
  './map.mp3',
  './battle.mp3',
  './feast.mp3',
  './activity.mp3',
  './victory.mp3',
  './c1_Peach_Garden_Oath.webp',
  './c2_Chain_Stratagem.webp',
  './c3_Three_Visits.webp',
  './c4_Straw_Boat_Arrows.webp',
  './c5_Red_Cliff_Fire.webp',
  './c6_Five_Passes_Six_Generals.webp',
  './c7_Battle_of_Changban.webp',
  './c8_Zhao_Yun_Rescues.webp',
  './c9_Scraping_the_Bone.webp',
  './c10_Flooding_Seven_Armies.webp',
  './c11_Seven_Captures.webp',
  './c13_Memorial.webp',
  './c14_Empty_City.webp',
  './c15_Sima_Prevails.webp',
  './sprites/logo.webp',
  './sprites/liubei.webp',
  './sprites/guanyu.webp',
  './sprites/zhangfei.webp',
  './sprites/zhaoyun.webp',
  './sprites/huangzhong.webp',
  './sprites/machao.webp',
  './sprites/zhugeliang.webp',
  './sprites/jiangwei.webp',
  './sprites/weiyan.webp',
  './sprites/soldier1.webp',
  './sprites/soldier2.webp',
  './sprites/soldier3.webp',
  './sprites/soldier4.webp',
  './sprites/soldier5.webp',
  './sprites/general.webp',
  './sprites/caimao.webp',
  './sprites/caocao.webp',
  './sprites/caohong.webp',
  './sprites/caoren.webp',
  './sprites/diaochan.webp',
  './sprites/dongzhuo.webp',
  './sprites/ganning.webp',
  './sprites/gongsundu.webp',
  './sprites/gongsunzan.webp',
  './sprites/huanggai.webp',
  './sprites/huatuo.webp',
  './sprites/jiaxu.webp',
  './sprites/kingmulu.webp',
  './sprites/kingofloulan.webp',
  './sprites/liubiao.webp',
  './sprites/liuyan.webp',
  './sprites/liuzhang.webp',
  './sprites/lubu.webp',
  './sprites/lusu.webp',
  './sprites/luxun.webp',
  './sprites/madai.webp',
  './sprites/menghuo.webp',
  './sprites/oujing.webp',
  './sprites/pangtong.webp',
  './sprites/shamoke.webp',
  './sprites/simayi.webp',
  './sprites/sunquan.webp',
  './sprites/taishici.webp',
  './sprites/trungtrac.webp',
  './sprites/wangping.webp',
  './sprites/wangyun.webp',
  './sprites/wenchou.webp',
  './sprites/wuhuanchieftain.webp',
  './sprites/xiahoudun.webp',
  './sprites/xiahouyuan.webp',
  './sprites/xuchu.webp',
  './sprites/yanbaihu.webp',
  './sprites/yanliang.webp',
  './sprites/yongkai.webp',
  './sprites/yuanshao.webp',
  './sprites/yuantan.webp',
  './sprites/zhanghe.webp',
  './sprites/zhangjiao.webp',
  './sprites/zhangliao.webp',
  './sprites/zhanglu.webp',
  './sprites/zhouyu.webp',
  './sprites/zhugejin.webp',
  './sprites/zhurong.webp',
];

const EXTERNAL_FILES = [
  'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Ma+Shan+Zheng&family=Cinzel+Decorative:wght@700&display=swap',
];

const PRECACHE_URLS = LOCAL_FILES.map(path => new URL(path, SCOPE_URL).toString());

function shouldCache(response) {
  return !!response && (response.ok || response.type === 'opaque');
}

async function putInCache(cacheName, request, response) {
  if (!shouldCache(response)) return response;
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());
  return response;
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  return putInCache(cacheName, request, response);
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(response => putInCache(cacheName, request, response))
    .catch(() => null);
  if (cached) return cached;
  return networkPromise;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const appCache = await caches.open(APP_CACHE);
    await Promise.all(PRECACHE_URLS.map(url =>
      appCache.add(url).catch(err => console.warn('[SW] Could not precache:', url, err))
    ));

    const externalCache = await caches.open(EXTERNAL_CACHE);
    await Promise.all(EXTERNAL_FILES.map(url =>
      externalCache.add(new Request(url, { mode: 'no-cors' })).catch(err => console.warn('[SW] Could not precache external:', url, err))
    ));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  const validCaches = new Set([APP_CACHE, RUNTIME_CACHE, EXTERNAL_CACHE]);
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => !validCaches.has(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isExternalAsset = EXTERNAL_ORIGINS.has(url.origin);

  if (!isSameOrigin && !isExternalAsset) return;

  event.respondWith((async () => {
    if (event.request.mode === 'navigate') {
      try {
        const response = await fetch(event.request);
        await putInCache(RUNTIME_CACHE, event.request, response.clone());
        return response;
      } catch (err) {
        return caches.match(new URL('./index.html', SCOPE_URL).toString());
      }
    }

    if (isExternalAsset) {
      const response = await staleWhileRevalidate(event.request, EXTERNAL_CACHE);
      if (response) return response;
      return fetch(event.request);
    }

    try {
      return await cacheFirst(event.request, RUNTIME_CACHE);
    } catch (err) {
      const fallback = await caches.match(event.request);
      if (fallback) return fallback;
      if (event.request.destination === 'document') {
        return caches.match(new URL('./index.html', SCOPE_URL).toString());
      }
      throw err;
    }
  })());
});
