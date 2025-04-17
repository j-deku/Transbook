// axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://transbook-backend.onrender.com",
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data.message;
      if (message && message.toLowerCase().includes("token expired")) {
        // Remove the token and redirect to login
        localStorage.removeItem("token");
        toast.warn("Session expired. Please log in again.");
        window.location.href = "/login"; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
