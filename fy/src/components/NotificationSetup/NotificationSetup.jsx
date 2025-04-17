import { useContext, useEffect } from "react";
import { requestForToken, onMessageListener } from "../../firebase/firebaseConfig";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import axiosInstance from "../../../axiosInstance";

const NotificationSetup = () => {
  const { url } = useContext(StoreContext);

  useEffect(() => {
    const updateToken = async () => {
      const fcmToken = await requestForToken();
      if (fcmToken) {
        localStorage.setItem("fcmToken", fcmToken);
        // Only update backend if user is authenticated
        const authToken = localStorage.getItem("token");
        if (authToken) {
          try {
            await axiosInstance.post(
              `${url}/api/user/update-token`,
              { fcmToken },
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
            console.log("FCM token updated on backend");
          } catch (err) {
            console.error(
              "Error updating FCM token on backend:",
              err.response?.data || err.message
            );
          }
        } else {
          console.warn("User not logged in; skipping FCM token update.");
        }
      } else {
        console.warn("No FCM token available.");
      }
    };

    updateToken();

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        console.log("Foreground message received:", payload);
        if (payload.notification) {
          toast.info(`${payload.notification.title}: ${payload.notification.body}`);
        }
      })
      .catch((err) => console.error("Error on message listener:", err));
  }, [url]);

  return null;
};

export default NotificationSetup;
