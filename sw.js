// sw.js — cache básico con rutas relativas
const CACHE = 'via-cache-v3';
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
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
