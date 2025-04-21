import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../../axiosInstance"; // adjust the path if needed

const firebaseConfig = {
  apiKey: "AIzaSyDOMY_PtpH7l8U3c40Zr-eqd0Ev2jVOml0",
  authDomain: "toli-toli-bbea0.firebaseapp.com",
  projectId: "toli-toli-bbea0",
  storageBucket: "toli-toli-bbea0.firebasestorage.app",
  messagingSenderId: "622608058161",
  appId: "1:622608058161:web:0e33e56df6a92289e81210",
  measurementId: "G-WGM5X7HCC2"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestForToken = async () => {
  const url = import.meta.env.VITE_API_BASE_URL;
  try {
    const registration = await navigator.serviceWorker.ready;
    const currentToken = await getToken(messaging, { vapidKey: "BLyKaxjUNVYvCWI2qTr5LGbQ1crOsd8FJNEAXiRmhj1Jpu0ZdeZxWllO_aqW2fWhqH0-3LJ1EOPFC-gTmIN1fl0", serviceWorkerRegistration: registration, });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      // Only update the backend if a valid auth token exists
      const authToken = localStorage.getItem("token");
      if (authToken) {
        try {
          await axiosInstance.post(`${url}/api/user/update-token`, { fcmToken: currentToken }, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          console.log("FCM token updated on backend");
        } catch (updateError) {
          console.error("Error updating FCM token on backend:", updateError.response?.data || updateError.message);
        }
      } else {
        console.warn("No auth token found; skipping FCM token update.");
      }
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };
