// main.jsx
import './i18n'; // Import this at the top
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/StoreContext.jsx";
import { requestForToken } from './firebase/firebaseConfig.js';

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log("Combined SW registered with scope:", registration.scope);
    })
    .catch((err) => console.error("SW registration failed:", err));

      // Then request the FCM token
  const token = await requestForToken();
  console.log('FCM token:', token);

}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </BrowserRouter>
);
