// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoJp5Uk4uxY40wf63sOo5uLIbzcAJTV4U",
  authDomain: "suivisscol.firebaseapp.com",
  projectId: "suivisscol",
  storageBucket: "suivisscol.firebasestorage.app",
  messagingSenderId: "319519029719",
  appId: "1:319519029719:web:b41114f2accf04e6fa7392",
  measurementId: "G-YL0ZFDHQKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportez les services dont vous aurez besoin
export const auth = getAuth(app);
export const db = getFirestore(app);