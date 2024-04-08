import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWV6qeynCyft3cYLCpyZXRUrN2_nzub20",
  authDomain: "omega-poker.firebaseapp.com",
  projectId: "omega-poker",
  storageBucket: "omega-poker.appspot.com",
  messagingSenderId: "828376148142",
  appId: "1:828376148142:web:4a603560d1084fffbd653f"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore();
export { firebaseApp, db };
