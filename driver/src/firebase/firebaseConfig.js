import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axiosInstance from "../../axiosInstance"; // adjust the path if needed

const firebaseConfig = {
  apiKey: "AIzaSyA2rSk4t-cgCOJ7QDtjlzPEo7VV3xasWGU",
  authDomain: "transbook-26f54.firebaseapp.com",
  projectId: "transbook-26f54",
  storageBucket: "transbook-26f54.firebasestorage.app",
  messagingSenderId: "1082726282604",
  appId: "1:1082726282604:web:bc398a9e02830c65f7af49",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestForToken = async () => {
  const url = import.meta.env.VITE_API_BASE_URL;
  try {
    const currentToken = await getToken(messaging, { vapidKey: "BFBBtIQMH2_UFmDk7h0bnWaA55pE_eTKHXUy8b8G_hRSZB38C91Ga4LF9-pejxZli_afabqIQ59OQDHjRJIrNTQ" });
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
