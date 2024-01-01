// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-88634.firebaseapp.com",
  projectId: "mern-estate-88634",
  storageBucket: "mern-estate-88634.appspot.com",
  messagingSenderId: "734638285932",
  appId: "1:734638285932:web:fc4debaa25d60f73452449",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
