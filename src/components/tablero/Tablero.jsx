import "./Tablero.css"
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useParams } from 'react-router-dom';
import Columna from "../columna/Columna";
//import { columnasMock, tareasMock } from "../../mockData";

import { db } from "../../firebase";
import { addDoc, getDocs, collection, orderBy, query, where, limit, onSnapshot, doc, updateDoc, getDoc, runTransaction } from "firebase/firestore";


function Tablero() {

  /* Prueba conexion a BD */
  const [columnas, setColumnas] = useState([]);
  const columnasRef = collection(db, 'columnas');

  const initialStateValues = {
    nombre: "",
    posicion: "",
    proyecto: ""
  }

  const proyecto = useParams().id;

  const [columnasAdd, setColumnasAdd] = useState(initialStateValues);

  useEffect(() => {
    getColumnas();

    //getLastPosicion(); //
  }, []);

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

  /*FUNCIONAL* 
  const getColumnas = async () => {
    const columnas = [];

    const q = query(columnasRef, orderBy("posicion"))
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      columnas.push({id:doc.id, ...doc.data()})
    });
    setColumnas(columnas)
  }
  */

  const addColumna = async (columna) => {
    columna.posicion = await getPosicion();
    columna.proyecto = proyecto;
    await addDoc(columnasRef, columna);
  }

  const getPosicion = async () => {
    const pos = await getNumColumnas();
    if (pos == 0) {
      return 1;
    } else {
      return await getLastPosicion() + 1;
    }
  }

  const getLastPosicion = async () => {
    const q = query(columnasRef, where("proyecto", "==", proyecto), orderBy("posicion", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    const mayorPosicion = querySnapshot.docs[0].data().posicion;
    return mayorPosicion;
  }

  const getNumColumnas = async () => {
    const q = query(columnasRef, where("proyecto", "==", proyecto));
    const querySnapshot = await getDocs(q);
    const numColumnas = querySnapshot.size;
    return numColumnas;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!columnasAdd.nombre.trim()) { return; }
    addColumna(columnasAdd);
    setColumnasAdd({...initialStateValues})
  }

  const handleInput = (e) => {
    const {value} = e.target;
    setColumnasAdd({...columnasAdd, nombre: value})
  }

  /* FIN Prueba conexion a BD */

  // TAREAS
  /* 
  const getTareasByColumnaId = (columnaId) => {
    return tareasMock.filter((tarea) => tarea.columna === columnaId);
  };

  const [columnasData, setColumnasData] = useState(
    columnasMock.reduce((data, columna) => {
      data[columna.id] = {
        id: columna.id,
        nombre: columna.nombre,
        tareas: getTareasByColumnaId(columna.id),
      };
      return data;
    }, {})
  );
  */

  // COLUMNAS
  const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

  // COLUMNAS
  // const [columnas, setColumnas] = useState(columnasMock)

  // onDragEnd comun 
  const onDragEnd = (result) => {
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
    /*
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
      }
    }
    */
  }

  return (
    <div className="tablero-container">
      <h1 style={{color:"red"}}>nombreProyecto mock</h1>
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
                        //tareas={columnasData[columna.id].tareas}
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
      <form onSubmit={handleSubmit}>
        <input type="text" value={columnasAdd.nombre} onChange={handleInput}/>
        <button>Añadir columna</button>
      </form>
    </div>
  );
}

export default Tablero;