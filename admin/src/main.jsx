import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/StoreContext.jsx";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log("Combined SW registered with scope:", registration.scope);
    })
    .catch((err) => console.error("SW registration failed:", err));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter
      future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </BrowserRouter>
);
