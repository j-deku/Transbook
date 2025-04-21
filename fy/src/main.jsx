// main.jsx
import './i18n'; // your i18n setup
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import StoreContextProvider from './context/StoreContext.jsx';
import { requestForToken } from './firebase/firebaseConfig.js';

async function initFCM() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers aren’t supported in this browser.');
    return;
  }

  try {
    // 1) Register the FCM service worker at the root
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('FCM Service Worker registered with scope:', registration.scope);

    // 2) Ask the user for notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notifications permission not granted:', permission);
      return;
    }

    // 3) Retrieve and send the FCM token, passing in our SW registration
    const fcmToken = await requestForToken({ registration });
    console.log('FCM token:', fcmToken);
  } catch (err) {
    console.error('FCM initialization failed:', err);
  }
}

(async () => {
  // Initialize FCM before rendering the app (optional: tie this to a user action)
  await initFCM();

  // Mount your React app
  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </BrowserRouter>
  );
})();
