// 초대장을 기기에 저장해 두고, 인터넷이 없어도 열리게 한다.
// 파일을 수정해서 다시 배포할 때는 아래 버전 숫자를 올린다.
const CACHE = 'gala-invitation-v1';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'img/card.webp',
  'img/detail.webp',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 저장된 파일을 먼저 보여 주고, 뒤에서 새 파일을 받아 다음 방문 때 반영한다
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
