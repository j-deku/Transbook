import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true, default:"Hi there🙋‍♂️!, Welcome to transport booking platform. Login/register to book your rides now" },
  type: { type: String, enum: ['ride', 'system', 'promo', 'login', 'register'], default: 'ride' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;