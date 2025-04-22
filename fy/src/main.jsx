// main.jsx
import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import StoreContextProvider from './context/StoreContext.jsx';
import { requestForToken, onMessageListener } from './firebase/firebaseConfig.js';

(async function initializeAppAndFCM() {
  // 1) Register the service worker at the root scope
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered with scope:', registration.scope);
    } catch (swErr) {
      console.error('❌ Service Worker registration failed:', swErr);
    }
  } else {
    console.warn('⚠️ Service workers not supported by this browser.');
  }

  // 2) Request Notification permission
  if (Notification.permission === 'default') {
    await Notification.requestPermission();  // prompts the user :contentReference[oaicite:5]{index=5}
  }
  if (Notification.permission !== 'granted') {
    console.warn('🔕 Notification permission not granted:', Notification.permission);  // check static property :contentReference[oaicite:6]{index=6}
  } else {
    // 3) Retrieve the FCM token
    try {
      const token = await requestForToken();  // uses SW.ready under the hood :contentReference[oaicite:7]{index=7}
      console.log('🎟️ FCM token:', token);
    } catch (tokenErr) {
      console.error('❌ FCM token retrieval failed:', tokenErr);
    }
  }

  // 4) Optional: re‑request token on page focus as a fallback for token rotation
  window.addEventListener('focus', () => {
    requestForToken().then((t) => console.log('🔄 FCM token refreshed on focus:', t));
  });

  // 5) Listen for foreground messages
  onMessageListener().then((payload) => {
    console.log('📩 Foreground FCM message received:', payload);
  });

  // 6) Mount your React application
  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </BrowserRouter>
  );
})();
