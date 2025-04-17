import admin from "../firebaseAdmin.js"; // Initialized with your service account

export const sendPushNotification = async (fcmToken, payload) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };
    const response = await admin.messaging().send(message);
    console.log("Successfully sent push notification:", response);
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
};
