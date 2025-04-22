// utils/tokenService.js
import userModel from '../models/UserModel.js';

/**
 * Remove an invalid FCM token from any User that has it.
 *
 * @param {string} fcmToken  The FCM registration token to remove.
 * @returns {Promise<boolean>}  True if a user was updated; false otherwise.
 */
export async function removeTokenFromDatabase(fcmToken) {
  try {
    // Unset the fcmToken field on the matching user document
    const result = await userModel.findOneAndUpdate(
      { fcmToken },                   // find by token
      { $unset: { fcmToken: "" } },   // remove the field :contentReference[oaicite:0]{index=0}
      { new: false }                  // return the _previous_ document
    );

    if (result) {
      console.info(`Unset fcmToken for user ${result._id}`);  // logging success
      return true;
    } else {
      console.warn(`No user found with fcmToken=${fcmToken}`);  
      return false;
    }
  } catch (err) {
    console.error(`Failed to remove FCM token ${fcmToken}:`, err);
    return false;
  }
}
