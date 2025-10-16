// Scripts for Firebase v9+
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with the same config
const firebaseConfig = {
  apiKey: "AIzaSyChfHyr0fShetpMBsFoVs0yr2A7WoyQqFY",
  authDomain: "laboserve-94e91.firebaseapp.com",
  projectId: "laboserve-94e91",
  storageBucket: "laboserve-94e91.firebasestorage.app",
  messagingSenderId: "611445813679",
  appId: "1:611445813679:web:b81944195a46d61bb93f5a",
  measurementId: "G-40SW5FH3VK"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  );

  // Customize notification here - handle both notification and data payloads
  const notificationTitle = payload.notification?.title || 'Notifikasi Baru';
  const notificationOptions = {
    body: payload.notification?.body || 'Anda memiliki notifikasi baru.',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    // Add data to notification for click handling
    data: {
      clickAction: payload.data?.click_action || '/',
      reservationId: payload.data?.reservation_id || null,
      userId: payload.data?.user_id || null,
      labId: payload.data?.lab_id || null
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Get the click action from notification data
  const clickAction = event.notification.data?.clickAction || '/';

  // Navigate to the appropriate page when notification is clicked
  event.waitUntil(
    clients.openWindow(clickAction)
  );
});