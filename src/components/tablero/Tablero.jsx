import "./Tablero.css"
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom';
import Columna from "../columna/Columna";

import { db } from "../../firebase";
import { addDoc, getDocs, collection, orderBy, query, where, onSnapshot, doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";

import { useTareas } from "../../context/TareasContext";

function Tablero() {

  const proyecto = useParams().id;
  const [nombreProyecto, setNombreProyecto] = useState('');

  const [columnas, setColumnas] = useState([]);
  const columnasRef = collection(db, 'columnas');
  const tareasRef = collection(db, 'tareas');

  const initialStateValues = {
    nombre: "",
    posicion: "",
    proyecto: ""
  }

  const [columnasAdd, setColumnasAdd] = useState(initialStateValues);

  const [tareaDrag, setTareaDrag] = useState();

  const { getTareas } = useTareas();
  const [tareas, setTareas] = useState([]);

  const obtenerTareasTablero = async () => {
    const idsDeColumnas = columnas.map((columna) => columna.id);
    const tareasAll = await getTareas();
    const tareasFiltradas = tareasAll.filter((tarea) => idsDeColumnas.includes(tarea.columna));
    setTareas(tareasFiltradas);
  }

  useEffect(() => {
    obtenerTareasTablero();
  }, [columnas]);

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

  const updatePosicionTarea = (id, posPrevia, posNueva, columna) => {
    const tareaRef = doc(db, `tareas/${id}`);
    const tareasColumna = query(tareasRef, where('columna', '==', columna));

    runTransaction(db, async (transaction) => {
      // actualiza tareas intermedias
      if(posPrevia < posNueva) {
        for(let i=posPrevia+1; i<=posNueva; i++) {
          const q = query(tareasColumna, where("posicion", "==", i+1))
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i });
          })
        }
      } else {
        for(let i=posPrevia-1; i>=posNueva; i--) {
          const q = query(tareasColumna, where("posicion", "==", i+1))
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i+2 });
          })
        }
      }

      // actualiza tarea seleccionada
      transaction.update(tareaRef, { posicion: posNueva + 1});
    });
  };

  const updatePosicionTareaDistintaColumna = (id, posPrevia, colPrevia, posNueva, colNueva) => {
    const tareaRef = doc(db, `tareas/${id}`);
    const tareasColumnaOrigen = query(tareasRef, where('columna', '==', colPrevia), where('posicion', '>', posPrevia + 1));
    const tareasColumnaDestino = query(tareasRef, where('columna', '==', colNueva), where('posicion', '>', posNueva));

    runTransaction(db, async (transaction) => {
      // actualiza tareas afectadas
      // columna origen
      const querySnapshotOrigen = await getDocs(tareasColumnaOrigen);
      querySnapshotOrigen.forEach(async (doc) => {
        const tareaRef = doc.ref;
        const posicion = doc.data().posicion;
        await updateDoc(tareaRef, { posicion: posicion - 1});
      });

      // columna destino
      const querySnapshotDestino = await getDocs(tareasColumnaDestino);
      querySnapshotDestino.forEach(async (doc) => {
        const tareaRef = doc.ref;
        const posicion = doc.data().posicion;
        await updateDoc(tareaRef, { posicion: posicion + 1});
      });

      // actualiza tarea seleccionada
      transaction.update(tareaRef, { columna: colNueva, posicion: posNueva + 1});
    });
  };

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

    // arrastro tarea
    if(result.type === "tarea") {
      if (source.droppableId === destination.droppableId) {
        console.log('misma columna');
        setTareas(provTareas => reorder(provTareas, source.index, destination.index));
        updatePosicionTarea(result.draggableId, source.index, destination.index, destination.droppableId);
      } else {
        console.log('distinta columna');
        updatePosicionTareaDistintaColumna(result.draggableId, source.index, source.droppableId, destination.index, destination.droppableId);
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