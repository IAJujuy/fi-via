// sw.js — cache + Share Target POST handler
const CACHE = 'via-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './install.js',
  './pricing.html',
  './subscribe.html',
  './success.html',
  './cancel.html',
  './manifest.webmanifest',
  './assets/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle Share Target POST
  if (url.pathname.endsWith('/share-target')){
    if (event.request.method === 'POST'){
      event.respondWith((async () => {
        const formData = await event.request.formData();
        const file = formData.get('file');
        // Open a window (existing client) and post the file via object URL
        const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const client = allClients[0] || await self.clients.openWindow('./');
        const blobUrl = URL.createObjectURL(file);
        client.postMessage({ type: 'share-image', url: blobUrl });
        return Response.redirect('./', 303);
      })());
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
