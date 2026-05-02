const CACHE_NAME = 'biblioteca-v2';
const assets = [
  './',
  './index.html',
  './acerca de.html',
  './descargar app.html',
  './gemini190px.png',
  './gemini512px.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
