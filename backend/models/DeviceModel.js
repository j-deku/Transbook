import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fcmToken:  { type: String, required: true, unique: true },
    platform:  { type: String, enum: ['web','ios','android'], required: true },
    appVersion:{ type: String },
    lastUpdated: { type: Date, default: Date.now }
  });
  deviceSchema.index(
    { fcmToken: 1 },
    { unique: true, partialFilterExpression: { fcmToken: { $exists: true, $type: 'string', $ne: '' } } }
  );
  deviceSchema.index(
    { lastUpdated: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 30 }
  );

    const DeviceModel = mongoose.model('Device', deviceSchema);
    export default DeviceModel;