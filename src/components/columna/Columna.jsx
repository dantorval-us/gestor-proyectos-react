import "./Columna.css"
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
//import Tarea from "../tarea/Tarea";
//import { Droppable } from 'react-beautiful-dnd'

import { db } from "../../firebase";
import { useEffect, useRef, useState } from "react";

const Columna = ({ columna, tareas }) => {

  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(columna.nombre);
  const inputRef = useRef(null);

  useEffect(() => {
    if (modoEdicion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modoEdicion]);

  const cambiarModoEdicion = () => {
    setModoEdicion(!modoEdicion);
  };

  const updateNombre = (event) => {
    setNombre(event.target.value);
  };

  // Persistir en BD
  const updateNombreBD = async (id, nuevoNombre) => {
    cambiarModoEdicion();
    const columnaRef = doc(db,  `columnas/${id}`);
    await updateDoc(columnaRef, {
      nombre: nuevoNombre,
    });
  };

  const enterToUpdateNombre = async (event) => {
    if (event.key === 'Enter') {
      updateNombreBD(columna.id, nombre);
    }
  };

  const updateIndices = async (columnaRef) => {
    const columnaSnapshot = await getDoc(columnaRef);
    const { posicion, proyecto } = columnaSnapshot.data();
    const columnasRef = collection(db, 'columnas');
    const q = query(columnasRef, where("proyecto", "==", proyecto), where("posicion", ">", posicion))
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      const docRef = doc.ref;
      const posActualizada = doc.data()['posicion'] - 1;

      await updateDoc(docRef, { posicion: posActualizada}); 
    })
  }

  const deleteColumna = async (id) => {
    const columnaRef = doc(db, `columnas/${id}`);
    await updateIndices(columnaRef);
    await deleteDoc(columnaRef);
  };

  return (
    <div className="columna-container">

      {!modoEdicion ? 
        <h2 onDoubleClick={cambiarModoEdicion}>
          {nombre} 
        </h2>
      :
        <>
          <input
            type="text"
            value={nombre}
            onChange={updateNombre}
            onKeyDown={enterToUpdateNombre}
            // onBlur={cambiarModoEdicion}
            ref={inputRef}
          />
          <button onClick={() => updateNombreBD(columna.id, nombre)}>✓</button>
        </>
      }
      <button onClick={cambiarModoEdicion}>renombrar</button>
      <button onClick={() => deleteColumna(columna.id)}>X</button>

      {/* <Droppable droppableId={columna.id} type="tarea">
        {(provided) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="tareas-container"
          >
            {tareas.map((tarea, index) => (
              <Tarea key={tarea.id} tarea={tarea} index={index}/>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable> */}
    </div>
  );
};

export default Columna;