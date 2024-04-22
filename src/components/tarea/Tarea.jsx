import { useEffect, useRef, useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { Draggable } from "react-beautiful-dnd";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import "./Tarea.css"
import { db } from "../../firebase";
import { useDataContext } from "../../context/DataContext";
import MenuUD from "../menu-UD/MenuUD";

const Tarea = ({ tarea, index }) => {

  const { deleteTareaCtxt } = useDataContext();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(tarea.nombreTarea);
  const inputRef = useRef(null); 
  
  useEffect(() => {
    if (modoEdicion && inputRef.current) {
      const inputElement = inputRef.current.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [modoEdicion]);

  /* UPDATES */
  const cambiarModoEdicion = () => {
    setModoEdicion(!modoEdicion);
  };

  const updateNombre = (event) => {
    setNombre(event.target.value);
  };

  // Persistir en BD
  const updateNombreBD = async (id, nuevoNombre) => {
    cambiarModoEdicion();
    const tareaRef = doc(db,  `tareas/${id}`);
    await updateDoc(tareaRef, {
      nombreTarea: nuevoNombre,
    });
  };

  const enterToUpdateNombre = async (event) => {
    if (event.key === 'Enter') {
      updateNombreBD(tarea.id, nombre);
    }
  };

  /* DELETE */
  const updateIndices = async (tareaRef) => {
    const tareaSnapshot = await getDoc(tareaRef);
    const { posicion, columna } = tareaSnapshot.data();
    const tareasRef = collection(db, 'tareas');
    const q = query(tareasRef, where("columna", "==", columna), where("posicion", ">", posicion))
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      const docRef = doc.ref;
      const posActualizada = doc.data()['posicion'] - 1;

      await updateDoc(docRef, { posicion: posActualizada}); 
    })
  }

  const deleteTarea = async (id) => {
    //Borra del estado:
    deleteTareaCtxt(id);
    //Borra de BD:
    const tareaRef = doc(db, `tareas/${id}`);
    await updateIndices(tareaRef);
    await deleteDoc(tareaRef);
  }

  /* Tengo que mostrar y ocultar el componente MenuUD de esta manera
  porque con CSS y display: none devuelve el siguiente error:
  Failed prop type: MUI: The `anchorEl` prop provided to the component is invalid. */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    setIsMenuOpen(false);
  };

  return (
    <Draggable draggableId={tarea.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="d-flex justify-content-between align-items-start tarjeta"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {!modoEdicion ?
            <div className="h3-" onDoubleClick={cambiarModoEdicion}>
              {nombre}
            </div>
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
                            onMouseDown={() => updateNombreBD(tarea.id, nombre)}
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
          
          {!modoEdicion &&
          <div className="menu-ud">
            {isMenuOpen && 
              <MenuUD
                vertical={true}
                onUpdate={cambiarModoEdicion} 
                onDelete={() => deleteTarea(tarea.id)}
              />
            }
          </div>
          }
        </div>
      )}
    </Draggable>
  );
};

export default Tarea;