import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../../axiosInstance";

const firebaseConfig = {
  apiKey: "AIzaSyDOMY_PtpH7l8U3c40Zr-eqd0Ev2jVOml0",
  authDomain: "toli-toli-bbea0.firebaseapp.com",
  projectId: "toli-toli-bbea0",
  storageBucket: "toli-toli-bbea0.firebasestorage.app",
  messagingSenderId: "622608058161",
  appId: "1:622608058161:web:0e33e56df6a92289e81210",
  measurementId: "G-WGM5X7HCC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Requests an FCM registration token and updates backend if available.
 * @param {{ registration?: ServiceWorkerRegistration }} options - Optional service worker registration.
 * @returns {Promise<string | null>} The FCM token or null.
 */
export async function requestForToken({ registration } = {}) {
  try {
    // Ensure notifications are permitted
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted:', Notification.permission);
      return null;
    }

    // Use provided SW registration or wait until one is ready
    const reg = registration || await navigator.serviceWorker.ready;

    // Retrieve the token
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
      serviceWorkerRegistration: reg,
    });

    if (currentToken) {
      console.log('FCM Token:', currentToken);

      // Update token on backend if user is authenticated
      const authToken = localStorage.getItem('token');
      if (authToken) {
        try {
          await axiosInstance.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/user/update-token`,
            { fcmToken: currentToken },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          console.log('FCM token updated on backend');
        } catch (updateError) {
          console.error('Error updating FCM token on backend:', updateError);
        }
      } else {
        console.warn('No auth token found; skipping FCM token update.');
      }
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
}

/**
 * Listens for incoming FCM messages when the page is in the foreground.
 * @returns {Promise<any>} Promise that resolves with the message payload.
 */
export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

export { messaging };
