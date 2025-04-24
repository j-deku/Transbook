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
  // ▸ Build a data-only message:
  const message = {
    token: fcmToken,
    data: {
      title: payload.title,
      body:  payload.body,
      // spread any extra custom fields (e.g. url, tag)
      ...payload.data
    },
    // ensure high-priority on Android/iOS:
    android:  { priority: 'high' },
    apns:    { headers: { 'apns-priority': '10' } }
  }

  try {
    const messageId = await admin.messaging().send(message)
    console.info(`Data-only push sent (messageId=${messageId}) to token=${fcmToken}`)
    return messageId

  }  catch (err) {
    // Handle invalid/stale registration tokens
    if (err.code === 'messaging/registration-token-not-registered' ||
      err.code === 'messaging/third-party-auth-error') {
    console.warn(`Removing invalid FCM token: ${fcmToken} (code=${err.code})`);
    await removeTokenFromDatabase(fcmToken);
  }
   else {
      console.error(`Unexpected error sending push to token=${fcmToken}:`, err);
    }
    // Re-throw so callers know the send failed
    throw err;
  }
}
