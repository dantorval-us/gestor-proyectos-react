import { createContext, useContext, useEffect, useState } from "react";
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase"
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";

export const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  return context;
};

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const userGuardado = localStorage.getItem('user');
    return userGuardado==undefined ? JSON.parse(userGuardado) : null;
  });

  useEffect(() => {
    if (user != null) {
      localStorage.setItem('user', JSON.stringify(user.uid));
    }
    const suscribed = onAuthStateChanged(auth, (currentUser)=>{
      if(currentUser){
        setUser(currentUser);
      }
    });
    return () => suscribed();
  },[user]);

  const loginWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    return await signInWithPopup(auth, googleProvider);
  };

  /////////////////////////
  // const [tareas, setTareas] = useState(() => {
  //   const tareasRef = collection(db, 'tareas');
  //   const q = query(tareasRef); 
  //   return onSnapshot(q, (snapshot) => 
  //     setTareas(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))))
  // });
  
  const getTareas = async () => {

    const tareasRef = collection(db, 'tareas');
    const q = query(tareasRef);

    return new Promise((resolve, reject) => {
      onSnapshot(q, (snapshot) => {
        const tareasData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        resolve(tareasData);
      }, reject);
    });
  } 

  /////////////////////////
  
  const logout = async () => signOut(auth);
  
  return (
    <authContext.Provider value={{ loginWithGoogle, logout, user, setUser, getTareas }}>
      {children}
      {/*  */}
        <button onClick={getTareas}>TEST context</button>
      {/*  */}
    </authContext.Provider>
  );
  
}