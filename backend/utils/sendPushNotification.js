// utils/pushNotification.js
import admin from "../firebaseAdmin.js";
import logger from "../middlewares/logger.js";
import { removeTokenFromDatabase } from "./tokenService.js";

export async function sendPushNotification(fcmToken, payload) {
  // ▸ Build a data-only message:
  const message = {
    token: fcmToken,
    // 🔑 Use only data – no top-level notification key
    data: {
      title: payload.title,
      body:  payload.body,
      ...payload.data,             // pass all data fields
    },
    // ensure high-priority on Android/iOS:
    android: { priority: 'high', ttl: 3600 * 1000 },
    apns:    { headers: { 'apns-priority': '10', 'apns-expiration': `${Math.floor(Date.now()/1000)+3600}` } },
    fcmOptions: { analyticsLabel: payload.data.tag },
  }

  try {
    const messageId = await admin.messaging().send(message);
    logger.info("FCM message sent", { messageId, fcmToken });
    console.info("FCM message sent", { messageId, fcmToken });
    return messageId;
  } catch (err) {
    logger.error("FCM send error", { code: err.code, message: err.message });
    if (err.code === 'messaging/registration-token-not-registered') {
      await removeTokenFromDatabase(fcmToken);
    }
    // swallow or rethrow based on your needs
    throw err;
  }
}
