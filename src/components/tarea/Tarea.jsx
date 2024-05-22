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
import iconosTarea from "../../assets/data/iconos-tarea";

const Tarea = ({ tarea, index, nombreColumna }) => {

  const { deleteTareaCtxt, tareas, setTareas } = useDataContext();
  const id = tarea.id;
  const [nombre, setNombre] = useState(tarea.nombreTarea);
  const [descripcion, setDescripcion] = useState(tarea.descripcion);
  const [estimacion, setEstimacion] = useState(tarea.estimacion);
  const [icono, setIcono] = useState(tarea.icono);
  const [srcIcono, setSrcIcono] = useState(null);
  const tareaRef = doc(db, `tareas/${tarea.id}`);

  /* UPDATES */
  const handleUpdate = async () => {
    handleClickOpen(); 
  }

  const updateContext = (atributo, nuevoValor) => {
    const tareaIndex = tareas.findIndex(tarea => tarea.id === id);
    if (tareaIndex !== -1) {
        const nuevasTareas = [...tareas];
        nuevasTareas[tareaIndex][atributo] = nuevoValor;
        setTareas(nuevasTareas);
    }
  }

  // Persistir en BD
  const updateNombreBD = async (nuevoNombre) => {
    updateContext('nombreTarea', nuevoNombre);
    await updateDoc(tareaRef, {
      nombreTarea: nuevoNombre,
    });
  };

  const updateDescripcionBD = async (nuevaDescripcion) => {
    if (nuevaDescripcion !== undefined) {
      updateContext('descripcion', nuevaDescripcion);
      await updateDoc(tareaRef, {
        descripcion: nuevaDescripcion,
      });
    }
  }

  const updateEstimacionBD = async (nuevaEstimacion) => {
    if (nuevaEstimacion !== undefined) {
      updateContext('estimacion', nuevaEstimacion);
      await updateDoc(tareaRef, {
        estimacion: nuevaEstimacion,
      });
    }
  };

  const updateIconoBD = async (nuevoIcono) => {
    if (nuevoIcono !== undefined) {
      updateContext('icono', nuevoIcono);
      await updateDoc(tareaRef, {
        icono: nuevoIcono,
      });
    }
  };

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
            className={`
              tarjeta 
              ${nombreColumna === 'Finished' || nombreColumna === 'Finalizada' ? 'tarea-finalizada' : ''}
              ${nombreColumna === 'Backlog' ? 'tarea-backlog' : ''}
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="tarjeta-content d-flex flex-column justify-content-center">

              <div className="d-flex justify-content-between">
                <div className="nombre-tarea h3- align-self-center" onDoubleClick={handleUpdate}>
                  {nombre}
                </div>
                {isMenuOpen && 
                  <MenuUD
                    vertical={true}
                    onUpdate={handleUpdate} 
                    onDelete={handleDelete}
                  />
                }
              </div>

              {(icono || descripcion || estimacion>0) &&
                <div className="atributos-tarea" onClick={handleUpdate}>
                  {icono!==0 &&
                    <div className="atributo-tarea-1">
                        <Tooltip title={icono}>
                          <div>
                            <img src={iconosTarea[icono]} alt={icono} className="icono-tarea"/>
                          </div>
                        </Tooltip>
                    </div>
                  }
                  {descripcion &&
                    <div className="atributo-tarea-2">
                      <Tooltip title="Esta tarea cuenta con una descripción">
                        <NotesIcon className="notes-icon-desc-tarea"/>
                      </Tooltip>
                    </div>
                  }
                  {estimacion>0 &&
                    <div className="estimacion-tarea atributo-tarea-3">
                        <Tooltip title="Estimación de la tarea">
                          <span>{estimacion}</span>
                        </Tooltip>
                    </div>
                  }
                </div>
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
        updateNombreBD={updateNombreBD}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        updateDescripcionBD={updateDescripcionBD}
        estimacionTarea={estimacion}
        setEstimacionTarea={setEstimacion}
        updateEstimacionBD={updateEstimacionBD}
        iconoTarea={icono}
        setIconoTarea={setIcono}
        updateIconoBD={updateIconoBD}
        srcIconoTarea={srcIcono}
        setSrcIconoTarea={setSrcIcono}
      />
    </>
  );
};

export default Tarea;