// firebaseAdmin.js
import admin from "firebase-admin";
import serviceAccount from "./config/transbook-26f54-firebase-adminsdk-fbsvc-134232f3b5.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;