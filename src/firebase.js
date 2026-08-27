import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyBhNxqbWrBlG2xTmG5t3-Wz_O2AJ0dLAko",
  authDomain: "clinova-ebeb5.firebaseapp.com",
  projectId: "clinova-ebeb5",
  storageBucket: "clinova-ebeb5.firebasestorage.app",
  messagingSenderId: "638361736606",
  appId: "1:638361736606:web:25709eacfa01870a48b28f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);