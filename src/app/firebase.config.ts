import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA14LUJlrrF9qjTs_sdSKWoxcr4Nbmo4Yk",
  authDomain: "expert-link-pro.firebaseapp.com",
  projectId: "expert-link-pro",
  storageBucket: "expert-link-pro.appspot.com",
  messagingSenderId: "936590460150",
  appId: "1:936590460150:web:b376036b84b0a689db18d7",
  measurementId: "G-YL2DDQBBTG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Authentication

export { db, auth, app };
