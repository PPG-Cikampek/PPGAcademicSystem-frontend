// Firebase initialization for the web app
// Values are read from Vite env variables. Provide them via .env files.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Basic guard to help during local dev if envs are missing
const missing = Object.entries(firebaseConfig)
    .filter(([k, v]) => !v && k !== "measurementId")
    .map(([k]) => k);

if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(
        "Firebase config is missing keys:",
        missing.join(", "),
        "— add them to your .env file."
    );
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
