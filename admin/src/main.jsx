import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/StoreContext.jsx";
import { IdleTimerProvider } from "react-idle-timer";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log("Combined SW registered with scope:", registration.scope);
    })
    .catch((err) => console.error("SW registration failed:", err));
}

  const IDLE_TIMEOUT = 5 * 60 * 1000; 

  function Root() {
  
    // Called when user goes idle
    const handleOnIdle = () => {
      console.log('User idle – logging out');
      localStorage.removeItem("userInfo"); // Clear user info from local storage
      localStorage.removeItem("token"); // Clear user token from local storage
      localStorage.removeItem("adminId"); // Clear user ID from local storage    
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
  

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter
      future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
    <StoreContextProvider>
      <Root />
    </StoreContextProvider>
  </BrowserRouter>
);
