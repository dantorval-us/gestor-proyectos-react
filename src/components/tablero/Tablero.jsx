import "./Tablero.css"
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Columna from "../columna/Columna";
import { useDataContext } from "../../context";
import { getDocs, collection, query, where, doc, runTransaction, writeBatch } from "firebase/firestore";

function Tablero() {

  const { db, columnasRef, tareasRef, proyecto, columnas, setColumnas, tareas } = useDataContext();
  const [columnasData, setColumnasData] = useState({});
  const [dragId, setDragId] = useState(null);

  // ColumnasData
  const getTareasByColumnaId = (columnaId) => {
    return tareas.filter((tarea) => tarea.columna === columnaId);
  };

  useEffect(() => {
    const columnasDataUpdated = columnas.reduce((data, columna) => {
      data[columna.id] = {
        id: columna.id,
        nombre: columna.nombre,
        posicion: columna.posicion,
        tareas: getTareasByColumnaId(columna.id),
      };
      return data;
    }, {});
    setColumnasData(columnasDataUpdated);
  }, [columnas, tareas]);

  // COLUMNAS DnD
  const updatePosicionColumna = (id, posPrevia, posNueva) => {
    const columnaRef = doc(db,  `columnas/${id}`);
    const colsProyecto = query(columnasRef, where('proyecto', '==', proyecto));

    runTransaction(db, async (transaction) => {
      // actualiza columnas intermedias
      if(posPrevia < posNueva) {
        for(let i=posPrevia+1; i<=posNueva; i++ ) {
          const q = query(colsProyecto, where("posicion", "==", i));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i-1 });
          })
        }
      } else {
        for(let i=posPrevia-1; i>=posNueva; i-- ) {
          const q = query(colsProyecto, where("posicion", "==", i));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i+1 });
          })
        }
      }
      // actualiza columna seleccionada
      transaction.update(columnaRef, { posicion: posNueva});
    });
  }

  // TAREAS DnD
  const updatePosicionTareaMismaColumna = (tareaId, columnaId, posPrevia, posNueva) => {
    const tareaRef = doc(db, `tareas/${tareaId}`);
    const tareasColumna = query(tareasRef, where('columna', '==', columnaId));

    runTransaction(db, async (transaction) => {
      // actualiza tareas intermedias
      if(posPrevia < posNueva) { //hacia abajo
        for(let i=posPrevia+1; i<=posNueva; i++ ) {
          const q = query(tareasColumna, where("posicion", "==", i));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i-1 });
          })
        }
      } else { //hacia arriba
        for(let i=posPrevia-1; i>=posNueva; i-- ) {
          const q = query(tareasColumna, where("posicion", "==", i));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            transaction.update(doc.ref, { posicion: i+1 });
          })
        }
      }

      // actualiza tarea seleccionada
      transaction.update(tareaRef, { posicion: posNueva});
    });
  }

  const updatePosicionTareaDistintaColumna = async (tareaId, colPreviaId, colNuevaId, posPrevia, posNueva) => {
    const tareaRef = doc(db, `tareas/${tareaId}`);

    runTransaction(db, async (transaction) => {
      const batch = writeBatch(db);

      // actualiza tareas afectadas columna origen
      const qOrigen = query(collection(db, 'tareas'), where('columna', '==', colPreviaId), where('posicion', '>', posPrevia));
      const queryOrigenSnapshot = await getDocs(qOrigen);
      queryOrigenSnapshot.forEach((document) => {
        const nuevaPosicion = document.data().posicion - 1;
        const tareaAfectadaRef = doc(db, 'tareas', document.id);
        batch.update(tareaAfectadaRef, { posicion: nuevaPosicion });
      });
      // actualiza tareas afectadas columna destino
      const qDestino = query(collection(db, 'tareas'), where('columna', '==', colNuevaId), where('posicion', '>=', posNueva));
      const queryDestinoSnapshot = await getDocs(qDestino);
      queryDestinoSnapshot.forEach((document) => {
        const nuevaPosicion = document.data().posicion + 1;
        const tareaAfectadaRef = doc(db, 'tareas', document.id);
        batch.update(tareaAfectadaRef, { posicion: nuevaPosicion });
      });

      await batch.commit();

      // actualiza tarea seleccionada
      transaction.update(tareaRef, { 
        columna: colNuevaId,
        posicion: posNueva
      });
    });
  }

  //onDragStart comun
  const onDragStart = (result) => {
    const id = result.draggableId;
    setDragId(id); 
  }

  // onDragEnd comun
  const onDragEnd = (result) => {
    const {source, destination} = result;

    if (!destination || 
      (source.droppableId === destination.droppableId &&
      source.index === destination.index)) 
      {return};

    // arrastro columna
    if(result.type === "columna") {
      setColumnas(provColumnas => reorder(provColumnas, source.index, destination.index));
      updatePosicionColumna(dragId, source.index+1, destination.index+1);
    }

    // arrastro tarea
    if(result.type === "tarea") {

      const columnaOrigen = columnasData[source.droppableId];
      const tareaArrastrada = columnaOrigen.tareas[source.index];

      if (source.droppableId === destination.droppableId) {
        const nuevasTareas = Array.from(columnaOrigen.tareas);
        nuevasTareas.splice(source.index, 1);
        nuevasTareas.splice(destination.index, 0, tareaArrastrada);

        const nuevasColumnasData = {
          ...columnasData,
          [source.droppableId]: {
            ...columnaOrigen,
            tareas: nuevasTareas,
          },
        };
        setColumnasData(nuevasColumnasData);
        updatePosicionTareaMismaColumna(tareaArrastrada.id, columnaOrigen.id, source.index+1, destination.index+1);

      } else {
        const columnaDestino = columnasData[destination.droppableId];

        const nuevasTareasOrigen = Array.from(columnaOrigen.tareas);
        nuevasTareasOrigen.splice(source.index, 1);

        const nuevasTareasDestino = Array.from(columnaDestino.tareas);
        nuevasTareasDestino.splice(destination.index, 0, tareaArrastrada);

        const nuevasColumnasData = {
          ...columnasData,
          [source.droppableId]: {
            ...columnaOrigen,
            tareas: nuevasTareasOrigen,
          },
          [destination.droppableId]: {
            ...columnaDestino,
            tareas: nuevasTareasDestino,
          },
        };
        setColumnasData(nuevasColumnasData);
        updatePosicionTareaDistintaColumna(tareaArrastrada.id, columnaOrigen.id, columnaDestino.id, source.index+1, destination.index+1);

      }
    }
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    return result;
  };

  // Condición para renderizar el componente Columna
  const columnasCargadas = Object.keys(columnasData).length > 0;
  
  return (
    <div className="tablero-container">
      <h1>nombreProyecto mock</h1>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="columnas" direction="horizontal" type="columna">
          {(droppableProvided) => (
            <div 
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
              className="columnas-container"
            >
              {columnasCargadas && columnas.map((columna, index) => (
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
                        tareas={columnasData[columna.id].tareas}
                        index={index}
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
    </div>
  );
}

export default Tablero;