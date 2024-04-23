import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, where } from "@firebase/firestore";

const dataContext = createContext();

export function useDataContext() {
  return useContext(dataContext);
}

export function DataProvider({ children }) {

  const [proyecto, setProyecto] = useState(null);
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
      } catch(error) {
        console.log('Primer intento de obtener las columnas fallido:', error, 
        'Si este mensaje se muestra una única vez, es un error controlado');
      }
    }
    fetchData();
  }, [proyecto])

  const getColumnas = async () => {
    const q = query(columnasRef, where('proyecto', '==', proyecto), orderBy('posicion'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  const getTareas = async (columnasIds) => {
    const q = query(tareasRef, where('columna', 'in', columnasIds), orderBy('posicion'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  const deleteColumnaCtxt = (id) => {
    const nuevasColumnas = columnas.filter(columna => columna.id !== id);
    setColumnas(nuevasColumnas);
  }

  const deleteTareaCtxt = (id) => {
    const nuevasTareas = tareas.filter(tarea => tarea.id !== id);
    setTareas(nuevasTareas);
  }

  return (
    <dataContext.Provider 
      value={{ 
        db, columnasRef, tareasRef, 
        proyecto, setProyecto, 
        columnas, setColumnas, deleteColumnaCtxt,
        tareas, setTareas, deleteTareaCtxt 
      }}>
      {children}
    </dataContext.Provider>
  )
}