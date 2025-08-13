// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// This object is automatically generated and updated by the assistant.
// Do not change this object manually.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "lsaig-5o4m2.firebaseapp.com",
  projectId: "lsaig-5o4m2",
  storageBucket: "lsaig-5o4m2.appspot.com",
  messagingSenderId: "108399583152",
  appId: "1:108399583152:web:78c751221b065181716943",
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { app, auth };
