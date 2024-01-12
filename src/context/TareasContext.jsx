import { collection, onSnapshot, query } from "firebase/firestore";
import { createContext, useContext } from "react";
import { db } from "../firebase";

export const tareasContext = createContext();

export const useTareas = () => {
  const context = useContext(tareasContext);
  return context;
};

export function TareasProvider({ children }) {

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

  return (
    <tareasContext.Provider value={{ getTareas }}>
      {children}
    </tareasContext.Provider>
  );
}