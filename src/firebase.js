import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3vrNxshj6Xu7mF02MFKHDrjUU-fjSgp8",
  authDomain: "gestor-proyectos-c8232.firebaseapp.com",
  projectId: "gestor-proyectos-c8232",
  storageBucket: "gestor-proyectos-c8232.appspot.com",
  messagingSenderId: "545119994477",
  appId: "1:545119994477:web:5b60ef957bc2fb0c59b564"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

