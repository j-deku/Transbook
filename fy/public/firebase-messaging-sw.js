/* public/firebase-messaging-sw.js */
/* global workbox, importScripts, firebase */

// 1) Workbox precaching
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js')
workbox.precaching.cleanupOutdatedCaches()
const manifest = Array.isArray(self.__WB_MANIFEST) ? self.__WB_MANIFEST : []
if (manifest.length) {
  workbox.precaching.precacheAndRoute(manifest)
}

// 2) Firebase Messaging (modular in SW)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDOMY_PtpH7l8U3c40Zr-eqd0Ev2jVOml0',
  authDomain: 'toli-toli-bbea0.firebaseapp.com',
  projectId: 'toli-toli-bbea0',
  storageBucket: 'toli-toli-bbea0.firebasestorage.app',
  messagingSenderId: '622608058161',
  appId: '1:622608058161:web:0e33e56df6a92289e81210',
  measurementId: 'G-WGM5X7HCC2'
})

const messagingSW = firebase.messaging()

messagingSW.onBackgroundMessage(payload => {
  console.log('[SW] Received background message', payload)
  const title = payload.data?.title || payload.notification.title
  const options = {
    body: payload.data?.body || payload.notification.body,
    icon: '/TT-logo-32x32.png',
    badge: '/TT-logo-32x32.png',
    image: '/CarRent.jpeg',
    requireInteraction: true,
    tag: payload.data?.tag || 'toli-toli-notification',
    renotify: true,
    data: {
      url: payload.data?.url || '/',
      rideId: payload.data?.rideId || '',
      bookingId: payload.data?.bookingId || ''
    },
    actions: [{ action: 'close', title: 'Close' }],
    vibrate: [200, 100, 200]
  }

  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(list =>
    list.forEach(client => client.postMessage({ type: 'PLAY_SOUND', payload }))
  )
  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'close') return
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})

// Optional fetch logger for debugging
self.addEventListener('fetch', e => console.log('[SW] fetch:', e.request.url))

self.addEventListener('push', event => {
  console.log('[SW] push event data:', event.data?.text());
  const data = event.data.json();
  const title = data.data?.title || 'Notification';
  const options = { body: data.data?.body };
  event.waitUntil(self.registration.showNotification(title, options));
});
