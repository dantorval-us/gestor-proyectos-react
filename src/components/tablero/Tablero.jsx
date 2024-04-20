import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocs, collection, query, where, onSnapshot, doc, getDoc, runTransaction, writeBatch } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import "./Tablero.css"
import { useDataContext } from "../../context/DataContext";
import Columna from "../columna/Columna";
import NuevaColumna from "../nueva-columna/NuevaColumna";

function Tablero() {

  const { db, columnasRef, tareasRef, setProyecto, columnas, setColumnas, tareas } = useDataContext();
  const [columnasData, setColumnasData] = useState({});
  const [dragId, setDragId] = useState(null);

  const proyectoId = useParams().id;
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProyecto(proyectoId);
  }, [proyectoId, setProyecto])

  useEffect(() => {
    getNombreProyecto();
  }, []);

  useEffect(() => {
    // para escuchar los cambios en la colección "columnas", cada vez que añado una columna nueva
    const unsubscribe = onSnapshot(collection(db, 'columnas'), (snapshot) => {
      const columnasData = [];
      snapshot.forEach((doc) => {
        const columna = { id: doc.id, ...doc.data() };
        if (columna.proyecto === proyectoId) {
          columnasData.push(columna);
        }
      });
      columnasData.sort((a, b) => a.posicion - b.posicion);
      setColumnas(columnasData);
    });
    return () => unsubscribe();
  }, []);

  const getNombreProyecto = async () => {
    const proyectoRef = doc(db, `proyectos/${proyectoId}`);
    const proyectoSnap = await getDoc(proyectoRef);
    const nombre = proyectoSnap.data().nombre;
    await setNombreProyecto(nombre);
    setLoading(false);
  };

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
    const colsProyecto = query(columnasRef, where('proyecto', '==', proyectoId));

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
    const {source, destination, type} = result;

    if (!destination || 
      (source.droppableId === destination.droppableId &&
      source.index === destination.index)) 
      {return};

    // arrastro columna
    if(type === "columna") {
      setColumnas(provColumnas => reorder(provColumnas, source.index, destination.index));
      updatePosicionColumna(dragId, source.index+1, destination.index+1);
    }

    // arrastro tarea
    if(type === "tarea") {
      const columnaOrigen = columnasData[source.droppableId];

      if (source.droppableId === destination.droppableId) {
        /* ACTUALIZA DND */
        const nuevasTareas = Array.from(columnaOrigen.tareas);
        const tareaArrastrada = nuevasTareas.splice(source.index, 1)[0];
        nuevasTareas.splice(destination.index, 0, tareaArrastrada);
        nuevasTareas.forEach((tarea, index) => {
          if (index >= Math.min(source.index, destination.index) && index <= Math.max(source.index, destination.index)) {
            // Si la tarea está entre la posición original y la nueva posición de la tarea arrastrada, ajusta su posición
            tarea.posicion = index + 1; // Suma 1 para que las posiciones comiencen desde 1 en lugar de 0
          }
        });
        const nuevasColumnasData = {
          ...columnasData,
          [source.droppableId]: {
            ...columnaOrigen,
            tareas: nuevasTareas,
          },
        };
        setColumnasData(nuevasColumnasData);
        
        /* ACTUALIZA POSICIONES BD */
        updatePosicionTareaMismaColumna(tareaArrastrada.id, columnaOrigen.id, source.index+1, destination.index+1);

      } else {
        /* ACTUALIZA DND */
        const tareaArrastrada = columnaOrigen.tareas[source.index];
        const columnaDestino = columnasData[destination.droppableId];
        const nuevasTareasOrigen = Array.from(columnaOrigen.tareas);
        const nuevasTareasDestino = Array.from(columnaDestino.tareas);
        nuevasTareasOrigen.splice(source.index, 1);
        nuevasTareasDestino.splice(destination.index, 0, tareaArrastrada);

        // Actualiza las posiciones de las tareas en la columna de origen
        nuevasTareasOrigen.forEach((tarea, index) => {
            if (index >= source.index) {
                tarea.posicion = index + 1; // Suma 1 para que las posiciones comiencen desde 1 en lugar de 0
            }
        });

        // Actualiza las posiciones de las tareas en la columna de destino
        nuevasTareasDestino.forEach((tarea, index) => {
            tarea.posicion = index + 1; // Suma 1 para que las posiciones comiencen desde 1 en lugar de 0
        });

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

        tareaArrastrada.columna = columnaDestino.id;

        setColumnasData(nuevasColumnasData);

        /* ACTUALIZA POSICIONES BD */
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

  /* Material UI Dialog */
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Condición para renderizar el componente Columna
  const columnasCargadas = Object.keys(columnasData).length > 0;
  
  return (
    <>
      {!loading && 
        <div className="gral-container">
          <div className="tablero-container">
            <h1 className="h1-tablero">{ nombreProyecto }</h1>
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
                            {columnasData[columna.id] ? (
                              <Columna 
                                key={columna.id}
                                columna={columna} 
                                tareas={columnasData[columna.id].tareas}
                                tareasRef = {tareasRef}
                                index={index}
                              />
                            ) : null}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                    <IconButton className="btn-cuadrado" aria-label="Add" onClick={handleClickOpen}>
                      <AddIcon />
                    </IconButton>
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <NuevaColumna 
              open={open}
              onClose={handleClose}
              proyecto={proyectoId}
              columnasData={columnasData}
              columnasRef={columnasRef}
            />
          </div>
        </div>
      }
    </>
  );
}

export default Tablero;