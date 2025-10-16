const CACHE_NAME = 'laboserve-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/client/App.tsx',
  '/global.css',
  '/favicon.ico',
  '/placeholder.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Add notification click handler to the main service worker as well
// This handles clicks from notifications sent via Firebase Cloud Messaging
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked (in main SW):', event);
  event.notification.close();

  // Get the click action from notification data
  const clickAction = event.notification.data?.click_action || '/';

  // Navigate to the appropriate page when notification is clicked
  event.waitUntil(
    clients.openWindow(clickAction)
  );
});