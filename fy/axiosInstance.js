// axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// ── 1) Request interceptor: inject JWT into every request ────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── 2) Response interceptor: handle 401 errors (expired or malformed) ────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = (error.response.data.message || "").toLowerCase();
      if (msg.includes("token expired")) {
        cleanupAndRedirect("Session expired. Please log in again.");
      } else if (msg.includes("jwt malformed")) {
        cleanupAndRedirect("Invalid session. Please log in again.");
      } else if (msg.includes("jwt expired")) {
        cleanupAndRedirect("Session not active. Please log in again.");
      }
    }
    return Promise.reject(error);
  }
);

// ── 3) Helper: clear storage, notify, and redirect ────────────────────────
function cleanupAndRedirect(toastMessage) {
  // Remove all relevant items
  ["token", "userId", "userName","user", "userEmail","userImageUrl", "imageUrl", "Notifications"]
    .forEach(key => localStorage.removeItem(key));

  toast.error(toastMessage);
  window.location.href = "/";
}

export default axiosInstance;
