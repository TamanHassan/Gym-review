import admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

let serviceAccount = null;

if (process.env.NODE_ENV === "test") {
  console.warn("Firebase test mode enabled. Skipping Firebase Admin initialization.");
} else {
  try {
    console.log("FIREBASE_KEY_BASE64 present:", !!process.env.FIREBASE_KEY_BASE64);
    console.log("FIREBASE_KEY_JSON present:", !!process.env.FIREBASE_KEY_JSON);
    console.log("FIREBASE_KEY_PATH:", process.env.FIREBASE_KEY_PATH || "./firebase-key.json");
    // Try to load Firebase key from base64-encoded environment variable (for cloud deployment)
    if (process.env.FIREBASE_KEY_BASE64) {
      const decoded = Buffer.from(process.env.FIREBASE_KEY_BASE64, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
      console.log("Firebase key loaded from FIREBASE_KEY_BASE64 environment variable");
    } else if (process.env.FIREBASE_KEY_JSON) {
      // Try to load Firebase key from JSON environment variable
      serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);
      console.log("Firebase key loaded from FIREBASE_KEY_JSON environment variable");
    } else {
      // Fall back to file-based approach (for local development)
      const serviceAccountPath = resolve(process.env.FIREBASE_KEY_PATH || "./firebase-key.json");
      
      if (!existsSync(serviceAccountPath)) {
        throw new Error(`Firebase key file not found at ${serviceAccountPath}`);
      }

      const keyData = readFileSync(serviceAccountPath, "utf8");
      serviceAccount = JSON.parse(keyData);
      console.log("Firebase key loaded from file");
    }

    if (serviceAccount && !admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log("Firebase Admin initialized successfully");
    }
  } catch (error) {
    console.warn("Firebase Admin initialization failed. Running in test mode.", error.message);
    serviceAccount = null;
  }
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
