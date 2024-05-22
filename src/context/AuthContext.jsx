import { createContext, useContext, useEffect, useState } from "react";
import {
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase"

export const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  return context;
};

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const userGuardado = localStorage.getItem('user');
    return userGuardado===undefined ? JSON.parse(userGuardado) : null;
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
  
  const logout = async () => signOut(auth);
  
  return (
    <authContext.Provider value={{ loginWithGoogle, logout, user, setUser }}>
      {children}
    </authContext.Provider>
  );
  
}