// controllers/NotificationController.js
import Notification from "../models/NotificationModel.js";

/**
 * Create a new notification.
 * This endpoint can be called internally when an event occurs (e.g., ride response).
 */
const createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body; // type can be 'ride', 'system', etc.
    if (!userId || !message) {
      return res.status(400).json({ success: false, message: "Missing userId or message" });
    }
    const newNotification = new Notification({
      userId,
      message,
      type: type || "ride",
      isRead: false,
    });
    await newNotification.save();
    return res.status(201).json({ success: true, notification: newNotification });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get notifications for a specific user.
 */
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Mark a notification as read.
 */
const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({ success: false, message: "Missing notificationId" });
    }
    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    return res.status(200).json({ success: true, notification: updated });
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({ success: false, message: "Missing notificationId" });
    }
    await Notification.findByIdAndDelete(notificationId);
    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }
    await Notification.deleteMany({ userId });
    return res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export {createNotification, getNotifications, markNotificationRead, deleteNotification, clearAllNotifications}