// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTAaBe3uc7MvdIHQ_bPdkk-9G5cf23oG4",
  authDomain: "tinder-2-yt-dbdc5.firebaseapp.com",
  projectId: "tinder-2-yt-dbdc5",
  storageBucket: "tinder-2-yt-dbdc5.appspot.com",
  messagingSenderId: "939088529116",
  appId: "1:939088529116:web:aafb7c639b5c3a1a74d619",
  measurementId: "G-3ZXJH3F1DK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const auth = getAuth();

const db = getFirestore();

export { auth, db } 