import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBbsDRweJATGZhwuOlibbJaycus7ciHmAc",
  authDomain: "e-commerce-4b64d.firebaseapp.com",
  projectId: "e-commerce-4b64d",
  storageBucket: "e-commerce-4b64d.firebasestorage.app",
  messagingSenderId: "17449368910",
  appId: "1:17449368910:web:9db5cd37fe9c042f5fb21f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const fireDB = getFirestore(app);
const auth = getAuth(app);

export { fireDB, auth };