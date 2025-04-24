/* public/firebase-messaging-sw.js */
/* global workbox, importScripts, firebase */
// --- 1) Install & Activate: Claim clients immediately ---
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// --- 2) Raw push listener: catch all pushes and fix URL origin ---
self.addEventListener('push', event => {
  console.log('[SW] Raw push event received:', event);
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (err) {
    console.error('[SW] Error parsing push data:', err);
    return;
  }

  const title = data.data?.title || data.notification?.title || 'Notification';
  const body = data.data?.body || data.notification?.body;

  // Build absolute URL for click action
  let clickUrl = data.data?.url || '/';
  if (clickUrl.startsWith('/')) {
    clickUrl = self.location.origin + clickUrl;
  }

  const options = {
    body,
    icon: '/TT-logo-32x32.png',
    badge: '/TT-logo-32x32.png',
    image: '/CarRent.jpeg',
    requireInteraction: true,
    tag: data.data?.tag || data.notification?.tag,
    renotify: true,
    data: { ...data.data, url: clickUrl },
    actions: [{ action: 'close', title: 'Close' }],
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// --- 3) Workbox precaching & route ---
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
workbox.precaching.cleanupOutdatedCaches();
const manifest = Array.isArray(self.__WB_MANIFEST) ? self.__WB_MANIFEST : [];
if (manifest.length) {
  workbox.precaching.precacheAndRoute(manifest);
}

// --- 4) Firebase Messaging compat for background messages ---
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDOMY_PtpH7l8U3c40Zr-eqd0Ev2jVOml0',
  authDomain: 'toli-toli-bbea0.firebaseapp.com',
  projectId: 'toli-toli-bbea0',
  storageBucket: 'toli-toli-bbea0.firebasestorage.app',
  messagingSenderId: '622608058161',
  appId: '1:622608058161:web:0e33e56df6a92289e81210',
  measurementId: 'G-WGM5X7HCC2'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('[SW] Received background message via FCM:', payload);
  const title = payload.data?.title || payload.notification?.title || 'Notification';
  const body = payload.data?.body || payload.notification?.body;

  // Build absolute URL for click action
  let clickUrl = payload.data?.url || '/';
  if (clickUrl.startsWith('/')) {
    clickUrl = self.location.origin + clickUrl;
  }

  const options = {
    body,
    icon: '/TT-logo-32x32.png',
    badge: '/TT-logo-32x32.png',
    image: '/CarRent.jpeg',
    requireInteraction: true,
    tag: payload.data?.tag || payload.notification?.tag,
    renotify: true,
    data: { ...payload.data, url: clickUrl },
    actions: [{ action: 'close', title: 'Close' }],
    vibrate: [200, 100, 200]
  };

  // Notify clients to play a sound
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients =>
    clients.forEach(client => client.postMessage({ type: 'PLAY_SOUND', payload }))
  );

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// --- 5) Notification click handler ---
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  const clickUrl = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url === clickUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(clickUrl);
      }
    })
  );
});
