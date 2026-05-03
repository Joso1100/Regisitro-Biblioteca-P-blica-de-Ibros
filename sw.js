const CACHE_NAME = 'biblioteca-8'; // Subimos la versión para forzar la actualización
const assets = [
  './',
  './index.html',
  './acerca de.html',
  './descargar app.html',
  './gemini190px.png',
  './gemini512p.png', // Nombre corregido y unificado
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza a que el nuevo Service Worker se active de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

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
    fetch(event.request)
      .then(networkResponse => {
        // Si hay internet y la petición es exitosa, guardamos la versión más nueva en caché
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Si falla la red (el usuario está offline), servimos lo que hay en la caché
        return caches.match(event.request);
      })
  );
});
