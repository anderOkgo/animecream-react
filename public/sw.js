const VERSION = '1.1.21';
const CACHE_NAME = `animecream-${VERSION}`;
const appfiles = [`./android-icon-192x192.ico`];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(appfiles).then(() => {
        console.log('Cache installation successful');
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(async (res) => {
      if (res || false) if (res.type !== 'cors' || !res.url.includes(self.location.origin)) return res; // Return cached resource exept cors
      return fetch(e.request) // Try to fetch the resource from the network
        .then((response) => {
          const responseClone = response.clone(); // Clone the response to use it and store it in the cache
          caches.open(CACHE_NAME).then((cache) => {
            if (e.request.method === 'GET' && e.request.url.startsWith('http')) {
              cache.put(e.request, responseClone);
            }
          });
          return response;
        })
        .catch(() => {
          return caches.match(e.request);
        });
    })
  );
});

self.addEventListener('activate', (e) => {
  const cacheWhitelist = [CACHE_NAME];

  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});
