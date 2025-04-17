import { useState, useEffect, useContext, useCallback } from 'react';
import './NotificationCenter.css'
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Button,
  useMediaQuery,
  ListItemButton,
  Grow
} from '@mui/material';
import { MdClose, MdNotifications } from 'react-icons/md';
import { toast } from 'react-toastify';
import { socket } from '../../../Provider/UserSocketProvider';
import axiosInstance from '../../../axiosInstance';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const { url } = useContext(StoreContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();

  // Fetch persistent notifications from the backend
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const response = await axiosInstance.get(`${url}/api/notification/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
      } else {
        toast.warn(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      toast.info("Hi there 🙋‍♂️!, Welcome to Transport booking platform.\n Please login now");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    // Initial load of persistent notifications
    fetchNotifications();

    // Listen for real-time notifications from the socket
    socket.on("rideResponseUpdate", (data) => {
      console.log("Received rideResponseUpdate event:", data);
      if (data && data.response && data.ride && data.booking) {
        const newNotification = {
          _id: data.notificationId || Date.now().toString(),
          message:
            data.response === "approved"
              ? `Your ride from ${data.ride.pickup} to ${data.ride.destination} has been approved.`
              : `Your ride from ${data.ride.pickup} to ${data.ride.destination} has been declined.`,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        setNotifications((prev) => [newNotification, ...prev]);
        // Open notification center on receiving new notifications
        setIsOpen(true);
      }
    });

    return () => {
      socket.off("rideResponseUpdate");
    };
  }, [fetchNotifications]);

  // Auto-hide notification center after 10 seconds when opened
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Mark individual notification as read
  const markNotificationRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `${url}/api/notification/mark-read`,
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Delete a single notification
  const clearNotification = async (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `${url}/api/notification/delete`,
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    // Optionally, call an endpoint to persist this update.
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    axiosInstance.delete(`${url}/api/notification/clear-all/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch((error) => console.error("Error clearing notifications:", error));
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className='notification-center'>
      {/* Toggle Button with Badge */}
      <IconButton
        sx={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 1400,
          bgcolor: 'background.paper',
          boxShadow: 2,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <MdClose size={28} />
        ) : (
          <Badge badgeContent={unreadCount} color="error">
            <MdNotifications size={28} />
          </Badge>
        )}
      </IconButton>

      {/* Notification Center Container with Animation */}
      <Grow in={isOpen} timeout={{ enter: 500, exit: 500 }}>
        <Box
          sx={{
            position: isMobile ? 'fixed' : 'fixed',
            top: isMobile ? 'auto' : 120,
            bottom: isMobile ? 0 : 'auto',
            right: isMobile ? 0 : 20,
            width: { xs: '100%', sm: 300 },
            maxHeight: '80vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 2,
            p: 2,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Notifications
            </Typography>
            <Button variant="outlined" size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
              Mark All Read
            </Button>
            <IconButton onClick={clearAllNotifications} aria-label="clear all">
              <Typography>Clear All</Typography>
            </IconButton>
          </Box>
          <Divider />
          {loading ? (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading notifications...
            </Typography>
          ) : notifications.length === 0 ? (
            <Typography variant="body2" sx={{ mt: 2 }}>
              No notifications available.
            </Typography>
          ) : (
            <List>
              {notifications.map((notif) => (
                <ListItemButton
                  key={notif._id}
                  onClick={() => markNotificationRead(notif._id)}
                  sx={{
                    backgroundColor: notif.isRead ? 'inherit' : 'rgba(0, 0, 0, 0.05)',
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={notif.message}
                    secondary={new Date(notif.createdAt).toLocaleString()}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => clearNotification(notif._id)}
                      aria-label="dismiss"
                    >
                      <MdClose />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItemButton>
              ))}
            </List>
          )}
          <Button fullWidth variant="outlined" onClick={fetchNotifications} sx={{ mt: 2 }}>
            Refresh
          </Button>
        </Box>
      </Grow>
    </div>
  );
};

export default NotificationCenter;
