import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLO9pqy753uI1bZIVbwiWq9BdLVGYEVsM",
  authDomain: "omega-poker-club.firebaseapp.com",
  projectId: "omega-poker-club",
  storageBucket: "omega-poker-club.appspot.com",
  messagingSenderId: "893350028988",
  appId: "1:893350028988:web:0afea12ad31054b75e92b9",
  measurementId: "G-ZWDW03F784",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();
export { firebaseApp, db };
