import { createContext, useContext, useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, orderBy, query, where } from "@firebase/firestore";

const dataContext = createContext();

export function useDataContext() {
  return useContext(dataContext);
}

export function DataProvider({ children }) {

  const proyecto = "nrZUhrxHFZuxHrrgrufo";
  const columnasRef = collection(db, 'columnas');
  const tareasRef = collection(db, 'tareas');

  const [columnas, setColumnas] = useState([]);
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const columnasData = await getColumnas();
        const columnasIds = columnasData.map(columna => columna.id);
        const tareasData = await getTareas(columnasIds);
        setColumnas(columnasData);
        setTareas(tareasData);
        // console.log('(CONTEXT) Columnas:', columnasData);
        // console.log('(CONTEXT) Tareas:', tareasData);
      } catch(error) {
        console.log('Error al obtener las columnas:', error);
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    console.log('columnas:', columnas);
  }, [columnas])

  const getColumnas = async () => {
    const q = query(columnasRef, where('proyecto', '==', proyecto), orderBy('posicion'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  const getTareas = async (columnasIds) => {
    const q = query(tareasRef, where('columna', 'in', columnasIds));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  return (
    <dataContext.Provider value={{ columnas, setColumnas, tareas }}>
      {children}
    </dataContext.Provider>
  )
}