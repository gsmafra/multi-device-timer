self.addEventListener('install', function(event) {
    // Perform install steps if necessary, e.g., caching
    console.log('Service Worker installing.');
});

self.addEventListener('fetch', function(event) {
    // You can intercept requests here
    event.respondWith(fetch(event.request));
});
