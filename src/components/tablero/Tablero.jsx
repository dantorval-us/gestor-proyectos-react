import "./Tablero.css"
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom';
import Columna from "../columna/Columna";

import { db } from "../../firebase";
import { addDoc, getDocs, collection, orderBy, query, where, onSnapshot, doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

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

  ////////////
  const { getTareas } = useAuth();
  // const [tareas, setTareas] = useState([]);

  const [tareas, setTareas] = useState([]);

  const getTareasByColumnaId = (columnaId) => {
    return tareas.filter((tarea) => tarea.columna === columnaId);
  };
  
  const [columnasData, setColumnasData] = useState({});

  const obtenerTareas = async () => {
    // console.log('columnas:', columnas);
    const idsDeColumnas = columnas.map((columna) => columna.id);
    // console.log('idsDeColumnas:', idsDeColumnas);

    const tareasAll = await getTareas();
    // console.log('TareasAll:', tareasAll);
    
    const tareasFiltradas = tareasAll.filter((tarea) => idsDeColumnas.includes(tarea.columna));
    // console.log('tareasFiltradas:', tareasFiltradas);

    setTareas(tareasFiltradas);
    // console.log('TAREAS:', tareas);    
  }

  //////////
  useEffect(() => {
    const initialData = columnas.reduce((data, columna) => {
      data[columna.id] = {
        id: columna.id,
        nombre: columna.nombre,
        tareas: getTareasByColumnaId(columna.id),
      };
      return data;
    }, {});
    setColumnasData(initialData);
  }, [tareas]);
  //////////

  useEffect(() => {
    obtenerTareas();
  }, [columnas]);

  ////////////

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

      //////////////////
      const columnaOrigen = columnasData[source.droppableId];
      const tareaArrastrada = columnaOrigen.tareas[source.index];
      const tareaRef = doc(db, `tareas/${result.draggableId}`);

      if (source.droppableId === destination.droppableId) {
        console.log('misma columna');

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

        await updateDoc(tareaRef, {
          posicion: destination.index + 1,
        });
        /* Devuelvo las tareas de la columna en la que suelto */
        console.log('Arrastro la tarea:', result.draggableId);
        const tareasColumna = tareas.filter((tarea) => result.destination.droppableId.includes(tarea.columna));
        console.log('A la columna:', result.destination.droppableId, tareasColumna);
        
        /* Excluyo la tarea arrastrada de la lista de tareas de la columna */
        const tareasColumnaSinArrastrada = tareasColumna.filter((tarea) => tarea.id !== tareaArrastrada.id);
        console.log('Tareas de la columna sin la tarea arrastrada:', tareasColumnaSinArrastrada);
        //Arrastro hacia abajo
        console.log('origen:', source.index);
        console.log('destino:', destination.index);
        console.log('tareaArrastrada:', tareaArrastrada);
        const tareasAfectadas = tareasColumnaSinArrastrada.filter((tarea) => tarea.posicion >= destination.index + 1)
        console.log('tareasAfectadas:', tareasAfectadas);       

        // /* Tomo las que tienen posicion igual o mayor */
        // const tareasAfectadas = tareasColumnaSinArrastrada.filter((tarea) => tarea.posicion >= destination.index + 1)
        // console.log('tareasAfectadas:', tareasAfectadas);
        // /* Actualizo su posicion */
        // const tareasActualizadas = tareas.map((tarea) => {
        //   if (tareasAfectadas.includes(tarea)) {
        //     // actualizo estado
        //     tarea.posicion = tarea.posicion + 1; 
        //     //actualizo BD
        //     updateDoc(doc(db, `tareas/${tarea.id}`), {
        //       posicion: tarea.posicion,
        //     });
        //   }
        //   return tarea;
        // });
        

      } else { 
        console.log('distinta columna');
        console.log('tareaArrastrada:', tareaArrastrada);

        await updateDoc(tareaRef, {
          columna: destination.droppableId,
          posicion: destination.index + 1,
        });

        

      }

      //////////////////

      // // // // // // // const tareaRef = doc(db, `tareas/${result.draggableId}`);

      // // // // // // // await updateDoc(tareaRef, {
      // // // // // // //   posicion: destination.index + 1,
      // // // // // // // });

      // // // // // // // if (source.droppableId !== destination.droppableId) {
      // // // // // // //   await updateDoc(tareaRef, {
      // // // // // // //     columna: destination.droppableId,
      // // // // // // //   });



        ////
        // const tareaDrag = tareas.find((tarea) => tarea.id === result.draggableId);

        // /* Devuelvo las tareas de la columna en la que suelto */
        // console.log('Arrastro la tarea:', result.draggableId);
        // const tareasColumna = tareas.filter((tarea) => result.destination.droppableId.includes(tarea.columna));
        // console.log('A la columna:', result.destination.droppableId, tareasColumna);
        
        // /* Tomo las que tienen posicion igual o mayor */
        // const tareasAfectadas = tareasColumna.filter((tarea) => tarea.posicion >= destination.index + 1)
        // console.log('tareasAfectadas:', tareasAfectadas);

        // /* Actualizo su posicion */
        // const tareasActualizadas = tareas.map((tarea) => {
        //   if (tareasAfectadas.includes(tarea)) {
        //     // actualizo estado
        //     tarea.posicion = tarea.posicion + 1; 
        //     //actualizo BD
        //     updateDoc(doc(db, `tareas/${tarea.id}`), {
        //       posicion: tarea.posicion,
        //     });
        //   }
        //   return tarea;
        // });

        // /* Resto 1 a la posicion de las tareas con posicion mayor que la tarea que saco de la columna */
        // /* Devuelvo las tareas de la columna de la que la saco */
        // console.log('Saco de la columna:', result.source.droppableId);
        // const tareasColumnaAnterior = tareas.filter((tarea) => result.source.droppableId.includes(tarea.columna));
        // console.log('tareasColumnaAnterior:', tareasColumnaAnterior);
        // /* selecciono las que tienen posicion mayor y les resto 1 */
        // const tareasAfectadasAnterior = tareasColumnaAnterior.filter((tarea) => tarea.posicion > source.index + 1)
        // /* Actualizo su posicion */
        // const tareasActualizadasAnterior = tareas.map((tarea) => {
        //   if (tareasAfectadasAnterior.includes(tarea)) {
        //     // actualizo estado
        //     tarea.posicion = tarea.posicion - 1; 
        //     //actualizo BD
        //     updateDoc(doc(db, `tareas/${tarea.id}`), {
        //       posicion: tarea.posicion,
        //     });
        //   }
        //   return tarea;
        // });


        // console.log('TODAS Tareas actualizadas:', tareasActualizadas);
        
        // /* Modifico estado "tareas" para cambiar la columna de la tarea que arrastro*/
        // tareaDrag.columna = destination.droppableId;
        ////


      // // // // // // // // }
    }
  }

  ////////////
  const test = () => {
    console.log('TAREAS:', tareas);
  }
  ////////////

  return (
    <div className="tablero-container">
      <h1>{ nombreProyecto }</h1>
      <button onClick={test}>TEST</button>
      <button onClick={obtenerTareas}>TEST obtenerTareas</button>
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
                        onTareaDrag={handleTareaClickDrag} //// eliminar todo lo relacionado con esto?
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