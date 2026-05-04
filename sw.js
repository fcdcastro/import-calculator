const CACHE_NAME = 'import-calc-v1';
const ASSETS = [
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/tax-calculator.js',
  'js/ncm-database.js',
  'js/currency.js',
  'js/containers.js',
  'js/alerts.js',
  'js/print.js',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
