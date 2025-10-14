// Scripts for Firebase v9+
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with the same config
const firebaseConfig = {
  apiKey: "AIzaSyChfHyr0fShetpMBsFoVs0yr2A7WoyQqFY",
  authDomain: "laboserve-94e91.firebaseapp.com",
  projectId: "laboserve-94e91",
  storageBucket: "laboserve-94e91.firebasestorage.app",
  messagingSenderId: "381622829169",
  appId: "1:381622829169:web:9ed61bccfef3b08a9c8bc1",
  measurementId: "G-6GHNC1FB4P"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received.', event);

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    console.error('Could not parse push data as JSON.', e);
    payload = { notification: { title: 'Notifikasi Baru', body: 'Anda memiliki pesan baru.' } };
  }

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: payload.data, // Pass along any extra data
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Navigate to the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});