import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// !!! IMPORTANT !!!
// Replace this with your own Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChfHyr0fShetpMBsFoVs0yr2A7WoyQqFY",
  authDomain: "laboserve-94e91.firebaseapp.com",
  projectId: "laboserve-94e91",
  storageBucket: "laboserve-94e91.firebasestorage.app",
  messagingSenderId: "611445813679",
  appId: "1:611445813679:web:b81944195a46d61bb93f5a",
  measurementId: "G-40SW5FH3VK"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const googleProvider = new GoogleAuthProvider();
export const reservationsCollection = collection(db, "reservasi");
