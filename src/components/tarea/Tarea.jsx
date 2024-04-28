import { useState } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { Draggable } from "react-beautiful-dnd";
import NotesIcon from '@mui/icons-material/Notes';
import Tooltip from '@mui/material/Tooltip';
import "./Tarea.css"
import { db } from "../../firebase";
import { useDataContext } from "../../context/DataContext";
import MenuUD from "../menu-UD/MenuUD";
import EditarTarea from "../editar-tarea/EditarTarea";

const Tarea = ({ tarea, index }) => {

  const { deleteTareaCtxt } = useDataContext();
  const [nombre, setNombre] = useState(tarea.nombreTarea);
  const [descripcion, setDescripcion] = useState(tarea.descripcion);
  const tareaRef = doc(db, `tareas/${tarea.id}`);
  
  /* UPDATES */

  const handleUpdate = async () => {
    handleClickOpen(); 
  }

  const updateNombre = (event) => {
    setNombre(event.target.value);
  };

  // Persistir en BD
  const updateNombreBD = async (nuevoNombre) => {
    await updateDoc(tareaRef, {
      nombreTarea: nuevoNombre,
    });
  };

  const updateDescripcionBD = async (nuevaDescripcion) => {
    await updateDoc(tareaRef, {
      descripcion: nuevaDescripcion,
    });
  }

  /* DELETE */
  const handleDelete = () => {
    deleteTarea(tarea.id);
  }

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

  /* Material UI Dialog */
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Draggable draggableId={tarea.id} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className="d-flex justify-content-between tarjeta"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="d-flex flex-column justify-content-center atrib-tarea">
              <div className="h3-" onDoubleClick={handleUpdate}>
                {nombre}
              </div>
              {descripcion &&
                <Tooltip title="Esta tarea cuenta con una descripción.">
                  <NotesIcon className="notes-icon-desc-tarea" onClick={handleUpdate}/>
                </Tooltip>
              }
            </div>
            <div className="menu-ud align-self-start">
              {isMenuOpen && 
                <MenuUD
                  vertical={true}
                  onUpdate={handleUpdate} 
                  onDelete={handleDelete}
                />
              }
            </div>
          </div>
        )}
      </Draggable>

      <EditarTarea 
        open={open}
        onClose={handleClose}
        nombreTarea={nombre}
        setNombreTarea={setNombre}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        updateNombreBD={updateNombreBD}
        updateDescripcionBD={updateDescripcionBD}
      />
    </>
  );
};

export default Tarea;