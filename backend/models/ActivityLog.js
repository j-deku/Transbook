// models/ActivityLog.js
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: ['user', 'admin']},
  adminEmail: { type: String, required: true },
  activity: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;