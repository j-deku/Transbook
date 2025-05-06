// utils/pushNotification.js
import admin from "../firebaseAdmin.js";
import logger from "../middlewares/logger.js";
import { removeTokenFromDatabase } from "./tokenService.js";
import dotenv from "dotenv";
dotenv.config();

// Default configuration (can be overridden per-call)
const DEFAULT_OPTIONS = {
  maxRetries:       5,       // how many times to retry before giving up
  baseBackoffMillis: 500,    // initial backoff delay in ms
  ttlMillis:        3600 * 1000, // default message TTL (1 hour)
};

/**
 * Send an FCM push notification with retry & exponential back‑off.
 *
 * @param {string} fcmToken - The target device’s FCM registration token.
 * @param {object} payload  - { title, body, data: { url, tag, ... } }
 * @param {object} [opts]   - Optional overrides:
 *   - maxRetries        {number} Maximum retry attempts (default 5)
 *   - baseBackoffMillis {number} Initial backoff in milliseconds (default 500)
 *   - ttlMillis         {number} TTL for notification (default 1h)
 *
 * @returns {Promise<string>} Resolves with FCM messageId on success.
 * @throws {Error} Throws the last encountered error after retries.
 */
export async function sendPushNotification(
  fcmToken,
  payload,
  opts = {}
) {
  const { maxRetries, baseBackoffMillis, ttlMillis } = {
    ...DEFAULT_OPTIONS,
    ...opts,
  };

  // Build absolute URL
  const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173")
    .replace(/\/$/, "");
  const fullUrl = `${FRONTEND_URL}${payload.data.url}`;

  // Prepare common message fields
  const message = {
    token: fcmToken,
    data: {
      title: payload.title,
      body:  payload.body,
      url:   fullUrl,
      tag:   payload.data.tag,
      ...payload.data,
    },
    android: {
      priority: 'high',
      ttl:      ttlMillis,
    },
    apns: {
      headers: {
        'apns-priority':   '10',
        'apns-expiration': `${Math.floor(Date.now() / 1000) + Math.floor(ttlMillis/1000)}`,
      }
    },
    fcmOptions: {
      analyticsLabel: payload.data.tag,
    }
  };

  // Helper to compute exponential back‑off with full jitter
  function getBackoffDelay(attempt) {
    const exp = Math.min(baseBackoffMillis * (2 ** attempt), ttlMillis);
    return Math.random() * exp;
  }

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const messageId = await admin.messaging().send(message);
      logger.info("FCM message sent",
        { messageId, fcmToken, attempt }
      );
      return messageId;
    } catch (err) {
      lastError = err;
      const { code, message: msg } = err;
      logger.error("FCM send error",
        { code, message: msg, attempt }
      );

      // If token is no longer valid, remove it and stop retrying
      if (code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/invalid-argument') {
        await removeTokenFromDatabase(fcmToken);
        throw err;
      }

      // If we've exhausted retries, re‑throw
      if (attempt === maxRetries) {
        logger.error("Push notification failed after max retries",
          { fcmToken, maxRetries }
        );
        throw err;
      }

      // Otherwise, wait for backoff delay before retrying
      const delay = getBackoffDelay(attempt);
      logger.info("Retrying push notification",
        { attempt: attempt + 1, delay }
      );
      await new Promise(res => setTimeout(res, delay));
    }
  }

  // In case loop somehow exits without return or throw
  throw lastError;
}
