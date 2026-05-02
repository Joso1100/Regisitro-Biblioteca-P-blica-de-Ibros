const CACHE_NAME = 'biblioteca-v3'; // Pongo v3 ya directamente
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
  self.skipWaiting(); // Fuerza a que se active de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Este es el evento que te faltaba para borrar la caché vieja
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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
