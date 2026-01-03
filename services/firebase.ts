
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In production, these should be set in your hosting provider's (Vercel/Netlify) Dashboard
const firebaseConfig = {
  // Added any casting to fix the TypeScript error: Property 'env' does not exist on type 'ImportMeta'
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyCkTLcQ_f__zMKG4fK-3hPWs-x5sOlMf1g",
  authDomain: "gamerz-kit.firebaseapp.com",
  projectId: "gamerz-kit",
  storageBucket: "gamerz-kit.firebasestorage.app",
  messagingSenderId: "941868584286",
  appId: "1:941868584286:web:2381bb2c29418471af13cf",
  measurementId: "G-TKRVS8NET4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ADMIN_EMAIL = "oyglkgg@gmail.com";
