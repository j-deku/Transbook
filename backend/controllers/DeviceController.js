import DeviceModel from '../models/DeviceModel.js';

// Upsert device token
export const registerDevice = async (req, res) => {
  const { fcmToken, platform, appVersion } = req.body;
  const userId = req.user.id;

  try {
    const device = await DeviceModel.findOneAndUpdate(
      { userId, fcmToken },
      { platform, appVersion, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, device });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove a device token (called when FCM marks it invalid)
export const removeDevice = async (req, res) => {
  const { token } = req.params;
  try {
    await DeviceModel.deleteOne({ fcmToken: token });
    return res.json({ success: true, message: 'Device removed' });
  } catch (err) {
    console.error('Device removal error:', err);
    return res.status(500).json({ success: false, message: 'Could not remove device' });
  }
};
