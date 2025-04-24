// src/main.jsx
import './i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from './firebase/firebaseConfig.js'

// Helper to convert a Base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)))
}

async function setupFCM() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service workers not supported')
    return
  }

  try {
    // 1) Register SW at root scope
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' }
    )
    console.log('✅ SW registered with scope:', registration.scope)

    // 2) Subscribe to PushManager directly to verify endpoint
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    })
    console.log('[PushManager] endpoint:', subscription.endpoint)

    // 3) Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('🔕 Notification permission not granted:', permission)
      return
    }

    // 4) Get FCM token via Firebase Messaging
    const fcmToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
    console.log('🎟️ FCM token:', fcmToken)

    // 5) Send token to your backend if needed
    const authToken = localStorage.getItem('token')
    if (authToken && fcmToken) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/update-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ fcmToken })
      })
      console.log('🔄 Token synced to backend')
    }

    // 6) Listen for foreground messages
    onMessage(messaging, payload => {
      console.log('📩 Foreground message:', payload)
      // TODO: show an in-app toast or notification UI
    })
  } catch (err) {
    console.error('❌ FCM setup error:', err)
  }
}

;(async () => {
  await setupFCM()

  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </BrowserRouter>
  )
})()
