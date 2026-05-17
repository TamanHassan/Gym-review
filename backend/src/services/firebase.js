import admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const serviceAccountPath = resolve(process.env.FIREBASE_KEY_PATH || "./firebase-key.json");

let serviceAccount = null;

if (process.env.NODE_ENV === "test") {
  console.warn("Firebase test mode enabled. Skipping Firebase Admin initialization.");
} else {
  try {
    if (!existsSync(serviceAccountPath)) {
      throw new Error(`Firebase key file not found at ${serviceAccountPath}`);
    }

    const keyData = readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(keyData);

    if (serviceAccount && !admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }
  } catch (error) {
    console.warn("Firebase Admin initialization failed. Running in test mode.", error.message);
    serviceAccount = null;
  }
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
