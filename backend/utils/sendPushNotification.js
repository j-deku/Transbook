// utils/pushNotification.js
import admin from "../firebaseAdmin.js";
import logger from "../middlewares/logger.js";
import { removeTokenFromDatabase } from "./tokenService.js";

// Read from your .env (falls back to localhost for dev)
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

export async function sendPushNotification(fcmToken, payload) {
  // Build an absolute link instead of "/myBookings"
  const fullUrl = `${FRONTEND_URL}${payload.data.url}`;

  const message = {
    token: fcmToken,
    data: {
      title: payload.title,
      body:  payload.body,
      url:   fullUrl,
      tag:   payload.data.tag,
      // include any other custom fields you need
      ...payload.data
    },
    android: { priority: 'high', ttl: 3600 * 1000 },
    apns:    { headers: {
      'apns-priority': '10',
      'apns-expiration': `${Math.floor(Date.now()/1000) + 3600}`
    }},
    fcmOptions: { analyticsLabel: payload.data.tag },
  };

  try {
    const messageId = await admin.messaging().send(message);
    logger.info("FCM message sent", { messageId, fcmToken });
    return messageId;
  } catch (err) {
    logger.error("FCM send error", { code: err.code, message: err.message });
    if (err.code === 'messaging/registration-token-not-registered') {
      await removeTokenFromDatabase(fcmToken);
    }
    throw err;
  }
}
