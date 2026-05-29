import admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

let serviceAccount = null;

if (process.env.NODE_ENV === "test") {
  console.warn("Firebase test mode enabled. Skipping Firebase Admin initialization.");
} else {
  try {
    // Keep logs minimal in production; only warn on failure.

    const tryParseJSON = (str) => {
      try {
        return JSON.parse(str);
      } catch (_) {
        return null;
      }
    };

    const markInfo = (s) => ({ length: s ? s.length : 0, containsPrivateKey: !!(s && s.includes('private_key')) });

    // Helper to attempt loading from an environment string which may be raw JSON or base64
    const loadFromEnvString = (envStr) => {
      if (!envStr) return null;
      const trimmed = envStr.trim();

      // 1) Try as raw JSON
      const direct = tryParseJSON(trimmed);
      if (direct) {
        return direct;
      }

      // 2) Try replacing escaped newlines (common when copying into some UIs)
      if (trimmed.includes('\\n')) {
        const replaced = trimmed.replace(/\\n/g, '\n');
        const reparsed = tryParseJSON(replaced);
        if (reparsed) {
          return reparsed;
        }
      }

      // 3) Try base64 decode -> parse
      try {
        const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
        const parsed = tryParseJSON(decoded);
        if (parsed) {
          return parsed;
        }
      } catch (e) {
        // ignore decode errors
      }

      return null;
    };

    // Try multiple env variables
    serviceAccount = loadFromEnvString(process.env.FIREBASE_KEY_BASE64) ||
      loadFromEnvString(process.env.FIREBASE_KEY_JSON) ||
      loadFromEnvString(process.env.FIREBASE_KEY) || null;

    if (!serviceAccount) {
      // Fall back to file-based approach (for local development)
      const serviceAccountPath = resolve(process.env.FIREBASE_KEY_PATH || './firebase-key.json');

      if (!existsSync(serviceAccountPath)) {
        throw new Error(`Firebase key file not found at ${serviceAccountPath}`);
      }

      const keyData = readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = tryParseJSON(keyData);
      if (!serviceAccount) throw new Error('Failed to parse firebase-key.json');
      console.log('Firebase key loaded from file', markInfo(keyData));
    } else {
    }

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
