/* Ophelia's Open Book app shell; full books remain online-only by design. */
const CACHE_NAME = 'ophelia-open-book-shell-2026-11-v7';
const SHELL = [
  './index.html',
  './catalog.html',
  './magazines.html',
  './my-bookshelf.html',
  './get-the-app.html',
  './offline.html',
  './manifest.webmanifest',
  './public/js/ophelia-app-install.js',
  './public/js/ophelia-reading-shelf.js',
  './public/art/ophelia-app-icon-192.png',
  './public/art/ophelia-app-icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ophelia-open-book-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  // Never cache huge book texts, external artwork, submissions, account data or narration.
  if (/\/public\/books\//.test(url.pathname)) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(response => {
        if (response.ok && (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/catalog.html') || url.pathname.endsWith('/magazines.html') || url.pathname.endsWith('/my-bookshelf.html') || url.pathname.endsWith('/get-the-app.html'))) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(req,copy)));
        }
        return response;
      }).catch(async () => (await caches.match(req,{ignoreSearch:true})) || (await caches.match('./offline.html')))
    );
    return;
  }
  // The catalog extracts its cards from index.html. Always get a fresh index
  // when online, even for an ordinary script fetch (not a navigation). Otherwise
  // the older service worker's cached index hides newly published books forever.
  if (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/catalog.html')) {
    event.respondWith(
      fetch(req).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(req, copy)));
        }
        return response;
      }).catch(async () => (await caches.match(req, {ignoreSearch:true})) || Response.error())
    );
    return;
  }
  if (SHELL.some(item => url.pathname.endsWith(item.replace(/^\.\//,'')))) {
    event.respondWith(caches.match(req,{ignoreSearch:true}).then(hit => hit || fetch(req)));
  }
});
