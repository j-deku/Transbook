import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { socket } from '../../provider/DriverSocketProvider';

const NotificationsContext = createContext();

const initialState = {
  notifications: [],
};

const notificationsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { notifications: [action.payload, ...state.notifications] };
    case 'CLEAR_NOTIFICATIONS':
      return { notifications: [] };
    default:
      return state;
  }
};

export const NotificationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('driverNotifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: parsed });
          console.log("Loaded notifications from localStorage:", parsed);
        } else {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
        }
      } else {
        localStorage.setItem('driverNotifications', JSON.stringify([]));
      }
    } catch (error) {
      console.error("Error loading notifications from localStorage:", error);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
    }
  }, []);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('driverNotifications', JSON.stringify(state.notifications));
      console.log("Saved notifications to localStorage:", state.notifications);
    } catch (error) {
      console.error("Error saving notifications to localStorage:", error);
    }
  }, [state.notifications]);

  // Setup Socket.IO listeners (ensure provider is mounted early)
  useEffect(() => {
    if (!socket) {
      console.warn("Socket not defined");
      return;
    }
    
    const handleRideUpdate = (data) => {
      console.log("Received rideUpdate event:", data);
      const newNotif = {
        message: `Ride from ${data.ride.pickup} to ${data.ride.destination} has been updated.`,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotif });
      toast.info(newNotif.message);
    };

    const handleGenericNotification = (data) => {
      console.log("Received generic notification:", data);
      const newNotif = {
        message: data.message,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotif });
      toast.info(data.message);
    };

    socket.on("rideUpdate", handleRideUpdate);
    socket.on("notification", handleGenericNotification);
    console.log("Socket listeners for notifications set up.");

    return () => {
      socket.off("rideUpdate", handleRideUpdate);
      socket.off("notification", handleGenericNotification);
      console.log("Socket listeners for notifications removed.");
    };
  }, []);

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications: state.notifications, clearNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

export default NotificationsProvider;