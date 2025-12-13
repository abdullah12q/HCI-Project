import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

console.log("Firebase Connected Successfully");

export default db;