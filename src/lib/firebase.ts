// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// This object is automatically generated and updated by the assistant.
// Do not change this object manually.
const firebaseConfig = {
  "projectId": "lsaig-5o4m2",
  "appId": "1:485861325401:web:d4b9c71fdd86b494e94f48",
  "storageBucket": "lsaig-5o4m2.appspot.com",
  "apiKey": "AIzaSyDFVqQ2lAbTHfxnOs1VT1yJQKRAkWJDf48",
  "authDomain": "lsaig-5o4m2.firebaseapp.com",
  "messagingSenderId": "485861325401"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { app, auth };
