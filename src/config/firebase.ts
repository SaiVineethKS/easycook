import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these with your actual Firebase config values from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyButmwkzy7gg-8XJpTMuWnMChVoyIw1hd0",
  authDomain: "easycook-2ad73.firebaseapp.com",
  projectId: "easycook-2ad73",
  storageBucket: "easycook-2ad73.firebasestorage.app",
  messagingSenderId: "532869779160",
  appId: "1:532869779160:web:a95adf4314f58189d251ad",
  measurementId: "G-43DQ1Z80J0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); 