import "./Tablero.css"
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom';
import Columna from "../columna/Columna";

import { db } from "../../firebase";
import { addDoc, getDocs, collection, orderBy, query, where, onSnapshot, doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";

function Tablero() {
  
  const proyecto = useParams().id;
  const [nombreProyecto, setNombreProyecto] = useState('');

  const [columnas, setColumnas] = useState([]);
  const columnasRef = collection(db, 'columnas');

  const initialStateValues = {
    nombre: "",
    posicion: "",
    proyecto: ""
  }

  const [columnasAdd, setColumnasAdd] = useState(initialStateValues);

  const [tareaDrag, setTareaDrag] = useState();

  useEffect(() => {
    getNombreProyecto();
    getColumnas();
  }, []);

  const getNombreProyecto = async () => {
    const proyectoRef = doc(db, `proyectos/${proyecto}`);
    const proyectoSnap = await getDoc(proyectoRef);
    const nombre = proyectoSnap.data().nombre;
    setNombreProyecto(nombre);
  };

  const updatePosicionColumna = (id, posPrevia, posNueva) => {
    const columnaRef = doc(db,  `columnas/${id}`);
    const colsProyecto = query(columnasRef, where('proyecto', '==', proyecto));

    runTransaction(db, async (transaction) => {
      // actualiza columnas intermedias
      if(posPrevia < posNueva) {
        for(let i=posPrevia+1; i<=posNueva; i++ ) {
          const q = query(colsProyecto, where("posicion", "==", i+1))
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i });
          })
        }
      } else {
        for(let i=posPrevia-1; i>=posNueva; i-- ) {
          const q = query(colsProyecto, where("posicion", "==", i+1))
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i+2 });
          })
        }
      }
      // actualiza columna seleccionada
      transaction.update(columnaRef, { posicion: posNueva + 1});
    });
  }

  const getColumnas = async () => {
    const q = query(columnasRef, where("proyecto", "==", proyecto), orderBy("posicion"))
    onSnapshot(q, (snapshot) => 
    setColumnas(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))))
  }

  const addColumna = async (columna) => {
    columna.posicion = await getPosicion();
    columna.proyecto = proyecto;
    await addDoc(columnasRef, columna);
  }

  const getPosicion = async () => {
    let pos = await getNumColumnas() + 1;
    return pos;
  }

  const getNumColumnas = async () => {
    const q = query(columnasRef, where("proyecto", "==", proyecto));
    const querySnapshot = await getDocs(q);
    const numColumnas = querySnapshot.size;
    return numColumnas;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!columnasAdd.nombre.trim()) { return; }
    addColumna(columnasAdd);
    setColumnasAdd({...initialStateValues})
  }

  const handleInput = (e) => {
    const {value} = e.target;
    setColumnasAdd({...columnasAdd, nombre: value})
  }

  const handleTareaClickDrag = (tareaId) => {
    setTareaDrag(tareaId);
  };

  /* COLUMNAS */
  const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

  // onDragEnd comun 
  const onDragEnd = async (result) => {
    const {source, destination} = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // arrastro columna
    if(result.type === "columna") {
      setColumnas(provColumnas => reorder(provColumnas, source.index, destination.index))
      updatePosicionColumna(result.draggableId, source.index, destination.index);
    }

    // TODO: arrastro tarea
    if(result.type === "tarea") {

      const tareaRef = doc(db, `tareas/${tareaDrag}`);

      await updateDoc(tareaRef, {
        posicion: destination.index + 1,
      });

      if (source.droppableId !== destination.droppableId) {
        await updateDoc(tareaRef, {
          columna: destination.droppableId,
        });


      }

    }
  }

  return (
    <div className="tablero-container">
      <h1>{ nombreProyecto }</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columnas" direction="horizontal" type="columna">
          {(droppableProvided) => (
            <div 
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
              className="columnas-container"
            >
              {columnas.map((columna, index) => (
                <Draggable draggableId={columna.id} key={columna.id} index={index}>
                  {(draggableProvided) => (
                    <div
                      {...draggableProvided.draggableProps}
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.dragHandleProps}
                    >
                      <Columna 
                        key={columna.id}
                        columna={columna} 
                        index={index}
                        onTareaDrag={handleTareaClickDrag}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <form onSubmit={handleSubmit}>
        <input type="text" value={columnasAdd.nombre} onChange={handleInput}/>
        <button>Añadir columna</button>
      </form>
    </div>
  );
}

export default Tablero;