import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

import {getDatabase} from 'firebase/database';

// Initialize Firebase
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_apiKey,
//   authDomain: process.env.FIREBASE_authDomain,
//   databaseURL: process.env.FIREBASE_databaseURL,
//   projectId: process.env.FIREBASE_projectId,
//   storageBucket: process.env.FIREBASE_storageBucket,
//   messagingSenderId: process.env.FIREBASE_messagingSenderId,
//   appId: process.env.FIREBASE_appId,
//   measurementId: process.env.FIREBASE_measurementId
//   };
const firebaseConfig = {
  apiKey: "AIzaSyC8wHa8QfrDXT46lkknSLdxGGiW1sp6G0Y",
  authDomain: "major-project-ap29.firebaseapp.com",
  databaseURL: "https://major-project-ap29-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "major-project-ap29",
  storageBucket: "major-project-ap29",
  messagingSenderId: "290866972249",
  appId: "1:290866972249:web:ffeaa1308a84956a9f5348",
  // measurementId: "G-XLSW3PRK51"
};


const app = initializeApp(firebaseConfig);
export const firebase_auth = getAuth(app);

export const db = getDatabase(app);
// export const auth = getAuth(app);

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
