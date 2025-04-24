// src/main.jsx
import './i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from './firebase/firebaseConfig.js'

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

    // 2) Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('🔕 Notification permission not granted:', permission)
      return
    }

    // 3) Get FCM token
    const vapidKey = 'BDSl_SrpS6IuLO3zl1_lLF5f6jZ2lrUdmHdt3u6LG3iut5NtMyMSREms0xUd5oPctD-GxOt9Lm8d52hF-zbXCqY'
    const fcmToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
    console.log('🎟️ FCM token:', fcmToken)

    // 4) Send token to your backend if needed
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

    // 5) Listen for foreground messages
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
