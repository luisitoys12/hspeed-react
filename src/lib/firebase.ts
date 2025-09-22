// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAYgRkL0gdopxs8Dl5JusRSDLsiMcbSUc0",
  authDomain: "hspeed-fan.firebaseapp.com",
  projectId: "hspeed-fan",
  databaseURL: "https://hspeed-fan-default-rtdb.firebaseio.com",
  storageBucket: "hspeed-fan.appspot.com",
  messagingSenderId: "699475017104",
  appId: "1:699475017104:web:6b9c9119babc0882774715",
  measurementId: "G-QS8BN1NR7T"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

const messaging = (typeof window !== 'undefined') ? getMessaging(app) : null;

export { app, auth, db, messaging, getToken, onMessage };
