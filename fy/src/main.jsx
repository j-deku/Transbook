// src/main.jsx
import './i18n';
import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { IdleTimerProvider } from 'react-idle-timer';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import StoreContextProvider, { StoreContext } from './context/StoreContext.jsx';

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
  
  const IDLE_TIMEOUT = 10 * 60 * 1000; 

  function Root() {
    const { logout } = useContext(StoreContext);
  
    // Called when user goes idle
    const handleOnIdle = () => {
      console.log('User idle – logging out');
      logout.exec();
      window.location.href = '/'; 
    };
  
    return (
      <IdleTimerProvider
        timeout={IDLE_TIMEOUT}
        onIdle={handleOnIdle}
        debounce={500}                      // batch rapid events :contentReference[oaicite:6]{index=6}
        events={['mousemove','keydown','wheel','touchstart']} // default set :contentReference[oaicite:7]{index=7}
      >
        <App />
      </IdleTimerProvider>
    );
  }
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <StoreContextProvider>
        <Root />
      </StoreContextProvider>
    </BrowserRouter>
  );
})();