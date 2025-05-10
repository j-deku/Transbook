import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  path: '/socket.io',
  transports: ['websocket','polling'],
  withCredentials: true,          // sends cookies/auth headers :contentReference[oaicite:11]{index=11}
});

const DriverSocketProvider = ({ children }) => {
  useEffect(() => {
    const driverId = localStorage.getItem("driverId");
    if (driverId) {
      socket.emit("joinDriverRoom", driverId);
      console.log(`Driver ${driverId} joined room`);
    } else {
      console.warn("Driver ID not found in localStorage. Please ensure it's set after login.");
    }

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("rideUpdate", (data) => {
      console.log("Received rideUpdate event:", data);
      toast.info("Ride update received!");
    });

    socket.on("rideReminder", (data) => {
      console.log("Received rideReminder event:", data);
      toast.info(`Reminder: Your ride from ${data.ride.pickup} is starting soon!`);
    });
 
    return () => {
      socket.off("rideUpdate");
      socket.off("rideReminder");
    };
  }, []);

  return <>{children}</>;
};

DriverSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export { socket };
export default DriverSocketProvider;
