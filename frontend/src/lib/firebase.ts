import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC2GZlmQfQGUKAeyek5H8stlcWrOzxKkNU",
  authDomain: "moshe-4c5ec.firebaseapp.com",
  projectId: "moshe-4c5ec",
  storageBucket: "moshe-4c5ec.firebasestorage.app",
  messagingSenderId: "749033609622",
  appId: "1:749033609622:web:fd8cd950edb23584ce25b7",
  measurementId: "G-6M82LC2THB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
