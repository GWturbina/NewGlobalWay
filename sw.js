const CACHE_NAME = 'globalway-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/translations.js',
    '/assets/images/background.jpg',
    '/assets/planets/planet-club.png',
    '/assets/planets/planet-mission.png',
    '/assets/planets/planet-goals.png',
    '/assets/planets/planet-roadmap.png',
    '/assets/planets/planet-projects.png',
    '/assets/planets/gwt-coin.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
