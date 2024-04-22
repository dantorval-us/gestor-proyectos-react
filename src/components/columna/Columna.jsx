import { useState, useRef, useEffect } from 'react';
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Droppable } from 'react-beautiful-dnd'
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import "./Columna.css"
import Tarea from "../tarea/Tarea";
import NuevaTarea from "../nueva-tarea/NuevaTarea";
import MenuUD from '../menu-UD/MenuUD';
import { db } from '../../firebase';
import { useDataContext } from '../../context/DataContext';

const Columna = ({ columna, tareas, tareasRef }) => {

  const { deleteColumnaCtxt } = useDataContext();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(columna.nombre);
  const inputRef = useRef(null);

  useEffect(() => {
    if (modoEdicion && inputRef.current) {
      const inputElement = inputRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
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
    //Borra del estado:
    deleteColumnaCtxt(id);
    //Borra de BD:
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

  return (
    <div className="columna-container">
      <div className="cuerpo">
        <div className="d-flex justify-content-between cabecera">
          {!modoEdicion ? 
            <>
              <h2 className="h2-columna" onDoubleClick={cambiarModoEdicion}>
                {nombre} 
              </h2>
              <MenuUD
                vertical={true}
                onUpdate={cambiarModoEdicion} 
                onDelete={() => deleteColumna(columna.id)}
              />
            </>
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
                    onBlur={cambiarModoEdicion}
                    ref={inputRef}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton color="primary" className="btn-cuadrado" 
                            onMouseDown={() => {updateNombreBD(columna.id, nombre)}}
                          >
                            <CheckIcon className="check-icon-nueva-tarea"/>
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </form>
            </>
          }
        </div>
        <Droppable droppableId={columna.id} type="tarea">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="tareas-container"
            >
              { // Reordena tareas antes de renderizarlas
              tareas.sort((a, b) => a.posicion - b.posicion).map((tarea, index) => (
                <Tarea key={tarea.id} tarea={tarea} index={index}/>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <div className="pie">
        <NuevaTarea 
          columna={columna.id} 
          numTareas={getNumTareas} 
          tareasRef={tareasRef}
        />
      </div>

    </div>
  );
};

export default Columna;