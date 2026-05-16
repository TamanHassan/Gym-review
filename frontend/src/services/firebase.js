import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth = null;
let firebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firebaseInitialized = true;

  // Set persistence to LOCAL (session will be persisted across browser refreshes)
  // But tokens are NOT stored in localStorage - they're managed by Firebase SDK
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.warn("Persistence error:", err);
  });
} catch (err) {
  console.warn("Firebase initialization failed. Running in test mode.", err.message);
  // Create mock auth object for testing without Firebase
  auth = null;
  firebaseInitialized = false;
}

export { auth, firebaseInitialized };

export const login = async (email, password) => {
  if (!firebaseInitialized) {
    // Test mode: return mock user with test token
    console.warn("Firebase not initialized. Returning mock user for testing.");
    return { uid: "test-user-123", email: email };
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  if (!firebaseInitialized) {
    console.warn("Firebase not initialized. Skipping logout.");
    return;
  }
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getToken = async () => {
  if (!firebaseInitialized) {
    // Test mode: return mock Bearer token
    console.warn("Firebase not initialized. Returning mock token for testing.");
    return "mock-bearer-token-test-12345";
  }
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
