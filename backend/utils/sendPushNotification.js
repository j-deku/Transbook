// utils/pushNotification.js
import admin from "../firebaseAdmin.js";
import { removeTokenFromDatabase } from "./tokenService.js";

/**
 * Send a push notification via FCM to a single device token.
 * On `registration-token-not-registered`, removes the token from the database.
 *
 * @param {string} fcmToken - The recipient device's FCM registration token.
 * @param {object} payload  - The notification payload: { title, body, data }.
 * @returns {Promise<string>} The message ID on success.
 * @throws Will re-throw unexpected errors after logging.
 */
export async function sendPushNotification(fcmToken, payload) {
  const message = {
    token: fcmToken,
    notification: {
      title: payload.title,
      body:  payload.body,
    },
    data: payload.data || {},
  };

  try {
    const messageId = await admin.messaging().send(message);
    console.info(`Push sent (messageId=${messageId}) to token=${fcmToken}`);
    return messageId;
  } catch (err) {
    // Handle invalid/stale registration tokens
    if (err.code === "messaging/registration-token-not-registered") {
      console.warn(`FCM token no longer registered: ${fcmToken}. Removing from database.`);
      await removeTokenFromDatabase(fcmToken);
    } else {
      console.error(`Unexpected error sending push to token=${fcmToken}:`, err);
    }
    // Re-throw so callers know the send failed
    throw err;
  }
}
