/* eslint-disable no-undef */
// 1) Load Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 2) Safely grab the injected manifest (or fall back to an empty array)
const precacheList = Array.isArray(self.__WB_MANIFEST)
  ? self.__WB_MANIFEST
  : [];

// 3) Only precache if we have entries
if (precacheList.length > 0) {
  workbox.precaching.precacheAndRoute(precacheList);
}

/* eslint-disable no-undef */
/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDOMY_PtpH7l8U3c40Zr-eqd0Ev2jVOml0",
  authDomain: "toli-toli-bbea0.firebaseapp.com",
  projectId: "toli-toli-bbea0",
  storageBucket: "toli-toli-bbea0.firebasestorage.app",
  messagingSenderId: "622608058161",
  appId: "1:622608058161:web:0e33e56df6a92289e81210",
  measurementId: "G-WGM5X7HCC2"
});

const messaging = firebase.messaging();

// Listen for background messages (when the page is not in focus or closed)
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message", payload);

  // Prefer data payload if available
  const notificationTitle = payload.data?.title || payload.notification.title;
  const notificationOptions = {
    body: payload.data?.body || payload.notification.body,
    icon: '/TT-logo-32x32.png',
    badge: '/TT-logo-32x32.png',
    image: "/CarRent.jpeg",
    requireInteraction: true, // Keep notification visible until interaction
    tag: payload.data?.tag || 'toli-toli-notification',
    renotify: true,
    timestamp: Date.now(),
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/', 
      rideId: payload.data?.rideId || '',
      bookingId: payload.data?.bookingId || '',
    },
    actions: [
      {
        action: 'close', // Custom action key to close the notification
        title: "Close",
      },
    ]
  };

  // Inform all client pages to play a custom sound (if allowed)
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'PLAY_SOUND',
        payload,
      });
    });
  });

  // Show the system notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Updated notification click handler with proper deep linking and close action handling
self.addEventListener('notificationclick', (event) => {
  console.log("Notification click event:", event);

  // If the user clicked the "close" action, simply close the notification and exit.
  if (event.action === 'close') {
    event.notification.close();
    return;
  }
  
  event.notification.close();

  // Determine URL to open (default to homepage if not provided)
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an open window that matches the deep link
      for (const client of clientList) {
        if (client.url.indexOf(urlToOpen) !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      // If not found, open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('fetch', e => console.log('Intercepting:', e.request.url));