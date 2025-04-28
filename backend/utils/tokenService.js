// utils/tokenService.js
import logger from '../middlewares/logger.js';
import userModel from '../models/UserModel.js';
import { Counter } from 'prom-client';

// Metric: counts how many tokens have been removed
const tokenRemovalCounter = new Counter({
  name: 'fcm_token_removals_total',
  help: 'Total number of FCM tokens removed from user records',
});

/**
 * Remove all instances of an invalid FCM token from user documents.
 * Uses updateMany for batch efficiency and increments removal metrics.
 * @param {string} fcmToken
 * @returns {Promise<boolean>} True if any documents were modified.
 */
export async function removeTokenFromDatabase(fcmToken) {
  try {
    const result = await userModel.updateMany(
      { fcmToken },                 // indexed query for fast lookups
      { $unset: { fcmToken: "" } } // remove the field
    );

    if (result.modifiedCount > 0) {
      tokenRemovalCounter.inc(result.modifiedCount);
      logger.info('Unset fcmToken for user(s)', { fcmToken, count: result.modifiedCount });
      return true;
    } else {
      logger.warn('No users found with fcmToken', { fcmToken });
      return false;
    }
  } catch (err) {
    logger.error('Error removing FCM token', { fcmToken, error: err });
    throw err; // let calling queue or service handle retries
  }
}
