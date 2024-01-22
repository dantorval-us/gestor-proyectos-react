import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import "./Tarea.css"
import { Draggable } from "react-beautiful-dnd";
import { db } from "../../firebase";
import { useEffect, useRef, useState } from "react";
import MenuUD from "../menu-UD/MenuUD";

const Tarea = ({ tarea, index, onTareaDrag }) => {

  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(tarea.nombreTarea);
  const inputRef = useRef(null);

  useEffect(() => {
    if (modoEdicion && inputRef.current) {
      inputRef.current.focus();
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
    const tareaRef = doc(db, `tareas/${id}`);
    await updateIndices(tareaRef);
    await deleteDoc(tareaRef);
  }

  const handleClickDrag = () => {
    onTareaDrag(tarea.id);
  };

  return (
    <Draggable draggableId={tarea.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="tarjeta"
          onMouseDown={handleClickDrag}
        >
          {!modoEdicion ?
            <p>{tarea.nombreTarea}</p>
          :
            <>
              <input 
                type="text" 
                value={nombre}
                onChange={updateNombre}
                onKeyDown={enterToUpdateNombre}
                ref={inputRef} 
              />
              <button onClick={() => updateNombreBD(tarea.id, nombre)}>✓</button>
            </>
          }

          <div>
            <MenuUD 
              onUpdate={cambiarModoEdicion} 
              onDelete={() => deleteTarea(tarea.id)}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Tarea;