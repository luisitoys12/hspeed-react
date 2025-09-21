// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYgRkL0gdopxs8Dl5JusRSDLsiMcbSUc0",
  authDomain: "hspeed-fan.firebaseapp.com",
  projectId: "hspeed-fan",
  storageBucket: "hspeed-fan.appspot.com",
  messagingSenderId: "699475017104",
  appId: "1:699475017104:web:6b9c9119babc0882774715",
  measurementId: "G-QS8BN1NR7T"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
