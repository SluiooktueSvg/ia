// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "lsaig-5o4m2",
  "appId": "1:485861325401:web:d4b9c71fdd86b494e94f48",
  "storageBucket": "lsaig-5o4m2.firebasestorage.app",
  "apiKey": "AIzaSyDFVqQ2lAbTHfxnOs1VT1yJQKRAkWJDf48",
  "authDomain": "lsaig-5o4m2.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "485861325401"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
