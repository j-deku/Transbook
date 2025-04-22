// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,      // For handling foreground messages
} from "firebase/messaging";
import axiosInstance from "../../axiosInstance";

const firebaseConfig = {
  apiKey:            "AIzaSyDOMY_PtpH7l8U3c40Zr-eqd0Ev2jVOml0",
  authDomain:        "toli-toli-bbea0.firebaseapp.com",
  projectId:         "toli-toli-bbea0",
  storageBucket:     "toli-toli-bbea0.firebasestorage.app",
  messagingSenderId: "622608058161",
  appId:             "1:622608058161:web:0e33e56df6a92289e81210",
  measurementId:     "G-WGM5X7HCC2"
};

// Initialize Firebase & Messaging
const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Prepares and returns a ready Service Worker registration,
 * ensuring the user has granted notification permission.
 */
async function prepareServiceWorker(registration) {
  if (Notification.permission === "default") {
    await Notification.requestPermission();        // ask once 
  }
  if (Notification.permission !== "granted") {
    console.warn("Notifications permission not granted:", Notification.permission);  // static check 
    return null;
  }
  return registration || await navigator.serviceWorker.ready;  // fallback if none passed 
}

/**
 * Requests an FCM registration token and syncs it with your backend.
 *
 * @param {{ registration?: ServiceWorkerRegistration }} opts
 * @returns {Promise<string|null>} The retrieved token, or null.
 */
export async function requestForToken({ registration } = {}) {
  try {
    const swReg = await prepareServiceWorker(registration);
    if (!swReg) return null;

    const token = await getToken(messaging, {
      vapidKey: "BLyKaxjUNVYvCWI2qTr5LGbQ1crOsd8FJNEAXiRmhj1Jpu0ZdeZxWllO_aqW2fWhqH0-3LJ1EOPFC-gTmIN1fl0",
      serviceWorkerRegistration: swReg,
    });  // retrieve token :contentReference[oaicite:4]{index=4}

    if (!token) {
      console.log("No FCM token available; please check permissions.");
      return null;
    }

    console.log("FCM token obtained:", token);

    // Sync with backend if user is logged in
    const authToken = localStorage.getItem("token");
    if (authToken) {
      await axiosInstance.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/update-token`,
        { fcmToken: token },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("FCM token synced to backend");
    }

    return token;
  } catch (err) {
    console.error("Failed to retrieve or sync FCM token:", err);
    return null;
  }
}

/**
 * Listens for incoming FCM messages when the app is in the foreground.
 *
 * @returns {Promise<any>} Resolves with the payload of the next message.
 */
export function onMessageListener() {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📩 Foreground FCM message received:", payload);  // handle in app
      resolve(payload);
    });
  });
}

// Note: onTokenRefresh removed—use manual getToken() calls instead.
export { messaging };
