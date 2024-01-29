import "./Columna.css"
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import Tarea from "../tarea/Tarea";
import { Droppable } from 'react-beautiful-dnd'

import { db } from "../../firebase";
import { useEffect, useRef, useState } from "react";
import NuevaTarea from "../nueva-tarea/NuevaTarea";
import MenuUD from "../menu-UD/MenuUD";
import { Box, Button, TextField } from "@mui/material";

const Columna = ({ columna, onTareaDrag }) => {

  const [tareas, setTareas] = useState([]);
  const tareasRef = collection(db, 'tareas');

  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(columna.nombre);
  const inputRef = useRef(null);

  useEffect(() => {
    getTareas();
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


  /* TAREAS */

  const getNumTareas = async () => {
    const q = query(tareasRef, where("columna", "==", columna.id));
    const querySnapshot = await getDocs(q);
    const numTareas = querySnapshot.size;
    return numTareas;
  }

  const getTareas = async () => {
    const q = query(tareasRef, where("columna", "==", columna.id), orderBy("posicion")); 
    onSnapshot(q, (snapshot) => 
    setTareas(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))))
  }

  return (
    <div className="columna-container">
      <div className="cuerpo">
        <div className="d-flex justify-content-between cabecera">
          {!modoEdicion ? 
            <h2 className="h2-columna" onDoubleClick={cambiarModoEdicion}>
              {nombre} 
            </h2>
          :
            <>
              <form>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <TextField 
                    variant="standard" 
                    className="textfield-update-nombre"
                    value={nombre}
                    onChange={updateNombre}
                    onKeyDown={enterToUpdateNombre}
                    ref={inputRef}
                  />
                  <Button 
                    className="btn-update" 
                    onClick={() => {updateNombreBD(columna.id, nombre)}}
                  >
                    ✓
                  </Button>
                </Box>
              </form>
            </>
          }
          
          <MenuUD
            vertical={true}
            onUpdate={cambiarModoEdicion} 
            onDelete={() => deleteColumna(columna.id)}
          />
        </div> 

        <Droppable droppableId={columna.id} type="tarea">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="tareas-container"
            >
              {tareas.map((tarea, index) => (
                <Tarea 
                  key={tarea.id} 
                  tarea={tarea} 
                  index={index}
                  onTareaDrag={onTareaDrag}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <div className="pie">
        <NuevaTarea columna={columna.id} numTareas={getNumTareas} tareasRef={tareasRef}/>
      </div>
    </div>
  );
};

export default Columna;