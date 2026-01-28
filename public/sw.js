const CACHE_NAME = 'petawiki-cache-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Não cache requests para API ou auth
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return fetch(request);
  }

  // Estratégia cache-first para assets
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => cache.match(request))
      .then(response => {
        return response || fetch(request);
      })
  );
});