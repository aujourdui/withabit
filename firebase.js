import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgNxkXQB2yen3Zfl2rc5H6UBNRhiYsZnE",
  authDomain: "withabit-50749.firebaseapp.com",
  projectId: "withabit-50749",
  storageBucket: "withabit-50749.firebasestorage.app",
  messagingSenderId: "46530124719",
  appId: "1:46530124719:web:e7736637e8cb58e3732d5a",
  measurementId: "G-6BDVWYDRXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Function to ensure anonymous authentication
export const ensureAnonymousAuth = async () => {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser.uid;
  } catch (error) {
    console.error("Anonymous authentication failed:", error);
    throw error;
  }
};

// Get current user ID (null if not authenticated)
export const getCurrentUID = () => {
  return auth.currentUser?.uid || null;
};