// routes/NotificationRoute.js
import express from "express";
import { 
  createNotification, 
  getNotifications, 
  markNotificationRead, 
  deleteNotification, 
  clearAllNotifications 
} from "../controllers/NotificationController.js";
import authMiddleware from "../middlewares/auth.js"; // Ensure authentication is applied

const notificationRouter = express.Router();

// Create a new notification (this can be used internally)
notificationRouter.post("/create", authMiddleware, createNotification);

// Get notifications for a specific user
notificationRouter.get("/user/:userId", authMiddleware, getNotifications);

// Mark a single notification as read
notificationRouter.post("/mark-read", authMiddleware, markNotificationRead);

// Delete a single notification
notificationRouter.post("/delete", authMiddleware, deleteNotification);

// Clear all notifications for a user
notificationRouter.delete("/clear-all/:userId", authMiddleware, clearAllNotifications);

export default notificationRouter;
