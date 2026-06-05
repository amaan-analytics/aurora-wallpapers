import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let storage;
let googleProvider;
let isFirebaseConfigured = false;

// Determine if we have valid environment values (not placeholders)
const isPlaceholder = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('placeholder') || 
  firebaseConfig.apiKey === '';

if (!isPlaceholder) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    isFirebaseConfigured = true;
    console.log("Aurora PWA: Firebase initialized successfully.");
  } catch (error) {
    console.error("Aurora PWA: Failed to initialize Firebase:", error);
  }
} else {
  console.warn("Aurora PWA: Firebase is using placeholder values. Auth and DB will operate in mockup mode.");
}

export { app, auth, db, storage, googleProvider, isFirebaseConfigured };
