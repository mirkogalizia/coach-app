import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check variabili mancanti
function assertConfig(cfg: Record<string, any>) {
  const missing = Object.entries(cfg)
    .filter(([_, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error("[Firebase] Missing env:", missing.join(", "));
    throw new Error(
      `Firebase env missing: ${missing.join(", ")}. ` +
      `Verifica .env.local (NEXT_PUBLIC_*) e riavvia 'npm run dev'.`
    );
  }
}
assertConfig(firebaseConfig as Record<string, any>);

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ FIX AGGIUNTO:
export { onAuthStateChanged };