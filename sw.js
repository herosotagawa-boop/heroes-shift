// Service Worker - キャッシュでオフライン対応 & ホーム画面追加を有効化
const CACHE = 'heroes-shift-v1';
const PRECACHE = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase / CDN のリクエストはネットワーク優先
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('unpkg.com') ||
      e.request.url.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // アプリ本体はキャッシュ優先（オフラインでも起動可能）
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
