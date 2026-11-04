const VERSION = '3.3.30';
const CACHE_NAME = `animecream-${VERSION}`;
const appfiles = ['./img/icon/android-icon-192x192.png'];

// Every URL of the app is the same index.html: one cached copy opens any of them offline, whatever
// its path or query (the installed app starts at /?utm_source=homescreen).
const SHELL = '/';
// A cached built file carries no Origin header but the page asks for it with one.
const MATCH = { ignoreVary: true };

// Keeps the whole app at install time, in this version's own cache. Waiting for the page's requests
// is not enough: they land in the previous cache, which activation deletes.
const precache = async (cache) => {
  await cache.addAll(appfiles);
  const response = await fetch(SHELL, { cache: 'reload' });
  if (!response.ok) throw new Error('Service worker: the page could not be fetched');
  const html = await response.clone().text();
  await cache.put(SHELL, response);
  await cache.addAll([...new Set(html.match(/\/assets\/[^"']+/g) || [])]);
};

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return precache(cache).then(() => {
        console.log('Cache installation successful');
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Pages: network first, so a deploy shows up on the first open instead of after a second reload;
  // offline, the last cached copy of the page.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Only the app's page replaces the shell: a navigation can also open robots.txt.
          if (response.ok && (response.headers.get('content-type') || '').includes('text/html')) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(SHELL, copy));
          }
          return response;
        })
        .catch(() => caches.match(SHELL, MATCH))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, MATCH).then(async (res) => {
      if (res || false)
        if (res.type !== 'cors' || !res.url.includes(self.location.origin))
          // If the resource is not a CORS request or doesn't belong to the same origin, return the cached response
          return res;
      // If resource is not in cache or is not a CORS request or doesn't belong to the same origin, fetch it from the network
      return fetch(e.request)
        .then((response) => {
          const responseClone = response.clone();
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              // Vite loads the built JS, CSS and fonts in cors mode. They are content-hashed, so
              // they are safe to keep and the app needs them offline. The API stays uncached.
              const url = new URL(e.request.url);
              const isBuiltFile = url.origin === self.location.origin && url.pathname.startsWith('/assets/');
              if (e.request.method === 'GET' && url.protocol.startsWith('http') && (e.request.mode !== 'cors' || isBuiltFile)) {
                cache.put(e.request, responseClone);
              }
            });
          }
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
            // Delete caches not in the whitelist
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      // Claim all clients to allow service worker to control them
      .then(() => self.clients.claim())
  );
});
