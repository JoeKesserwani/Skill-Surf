// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCoyZGd0XnnQleyir96wmXk4Gh9ID7eNq8",
  authDomain: "skillsurf-7c76c.firebaseapp.com",
  projectId: "skillsurf-7c76c",
  storageBucket: "skillsurf-7c76c.firebasestorage.app",
  messagingSenderId: "238644334933",
  appId: "1:238644334933:web:71edb909fcb6c113621fdc",
  measurementId: "G-JE08D29BCS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
