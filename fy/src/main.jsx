// src/main.jsx
import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import StoreContextProvider from './context/StoreContext.jsx';

(async () => {
  // Register Service Worker for Firebase Messaging
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      console.log('✅ Service worker registered with scope:', registration.scope);
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <StoreContextProvider>
        {/* NotificationSetup handles FCM token sync and onMessage internally */}
        <App />
      </StoreContextProvider>
    </BrowserRouter>
  );
})();
