import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDG9fT42lCVGWwGtNtVaQlEGCNfwPxBWI0",
    authDomain: "auth-62ae9.firebaseapp.com",
    projectId: "auth-62ae9",
    storageBucket: "auth-62ae9.appspot.com",
    messagingSenderId: "397934205271",
    appId: "1:397934205271:web:7e76cab664a95e378fc612"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
