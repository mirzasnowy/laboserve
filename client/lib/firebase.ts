import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, linkWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// !!! IMPORTANT !!!
// Replace this with your own Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS9x6UldXWKHoGipitpjMK8Lc6qNLD-_k", // DANGER: This is a placeholder key
  authDomain: "laboserve.firebaseapp.com",
  projectId: "laboserve",
  storageBucket: "laboserve.firebasestorage.app",
  messagingSenderId: "726269974117",
  appId: "1:726269974117:web:568c221989801e7404588c",
  measurementId: "G-9T5HD0JHFG",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
