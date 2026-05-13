import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

// Initialize Firebase Admin
const serviceAccountPath = resolve(process.env.FIREBASE_KEY_PATH || "./firebase-key.json");

let serviceAccount;
try {
  const keyData = readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(keyData);
} catch (error) {
  console.warn("Firebase key file not found. Running in test mode.");
  serviceAccount = null;
}

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
