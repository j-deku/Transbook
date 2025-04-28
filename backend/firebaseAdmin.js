// firebaseAdmin.js
import admin from "firebase-admin";
import serviceAccount from "./config/toli-toli-bbea0-firebase-adminsdk-fbsvc-e1f6626359.json" with { type: "json" };

if(!admin.apps.length) {
  // Initialize the Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;