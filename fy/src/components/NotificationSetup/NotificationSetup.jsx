// src/components/NotificationSetup.jsx
import { useEffect } from 'react'
import { messaging } from '../../firebase/firebaseConfig'
import { getToken, onMessage } from 'firebase/messaging'
import { toast } from 'react-toastify'
import axiosInstance from '../../../axiosInstance'

const NotificationSetup = () => {
  useEffect(() => {
    // 1) Request FCM token once, after service worker registration in main.jsx
    (async () => {
      try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
        const registration = await navigator.serviceWorker.ready
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
        console.log('🎟️ FCM token (from NotificationSetup):', token)
        if (token) {
          localStorage.setItem('fcmToken', token)
          const authToken = localStorage.getItem('token')
          if (authToken) {
            await axiosInstance.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/user/update-token`,
              { fcmToken: token },
              { headers: { Authorization: `Bearer ${authToken}` } }
            )
            console.log('🔄 FCM token synced to backend')
          }
        }
      } catch (err) {
        console.error('❌ NotificationSetup token error:', err)
      }
    })()

    // 2) Listen for foreground messages
    const unsubscribeOnMessage = onMessage(messaging, payload => {
      console.log('📩 Foreground FCM message:', payload)
      const { title, body } = payload.notification || {}
      if (title && body) {
        toast.info(`${title}: ${body}`)
      }
    })

    return () => {
      unsubscribeOnMessage()
    }
  }, [])

  return null
}

export default NotificationSetup