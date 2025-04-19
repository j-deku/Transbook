import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify"; 
import PropTypes from "prop-types";
import { jwtDecode } from 'jwt-decode';

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  path: '/socket.io',
  withCredentials: true,          // sends cookies/auth headers :contentReference[oaicite:11]{index=11}
  transports: ["websocket","polling"],
});

const UserSocketProvider = ({ children }) => {

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded.userId; // adjust based on your token structure
        if (userId) {
          localStorage.setItem("userId", userId);
          socket.emit("joinUserRoom", userId);
          console.log(`User ${userId} joined room.`);
        } else {
          console.warn("User id not found in token.");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.warn("Token not found in localStorage.");
    }

    socket.on("rideResponseUpdate", (data) => {
      console.log("Received rideResponseUpdate event:", data);
      if (data.response === "approved") {
        toast.success("Your ride has been approved!");
      } else if (data.response === "declined") {
        toast.error("Your ride has been declined.");
      }
      // Optionally update UI state here
    });

    return () => {
      socket.off("rideResponseUpdate");
    };
  }, []);

  return <>{children}</>;
};

UserSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { socket };
export default UserSocketProvider;
