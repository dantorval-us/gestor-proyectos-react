import "./Tablero.css"
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Columna from "../columna/Columna";
//import { columnasMock, tareasMock } from "../../mockData";

import { db } from "../../firebase";
import { addDoc, collection, getDocs, orderBy, query, onSnapshot, doc } from "firebase/firestore";


function Tablero() {

  /* Prueba conexion a BD */
  const [columnas, setColumnas] = useState([])
  const columnaRef = collection(db, 'columnas');

  const initialStateValues = {
    nombre: "",
    posicion: "",
    proyecto: ""
  }

  const [columnas2, setColumnas2] = useState(initialStateValues);

  useEffect(() => {
    getColumnas();
  }, []);

  const getColumnas = async () => {
    const q = query(columnaRef, orderBy("posicion"))
    onSnapshot(q, (snapshot) => 
    setColumnas(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))))
  }

  /*FUNCIONAL* 
  const getColumnas = async () => {
    const columnas = [];

    const q = query(columnaRef, orderBy("posicion"))
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      columnas.push({id:doc.id, ...doc.data()})
    });
    setColumnas(columnas)
  }
  */

  const addColumna = async (columna) => {
    await addDoc(columnaRef, columna);
    console.log("Añade la columna:", columna)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("Columna '" + columnas2.nombre + "' añadida")
    addColumna(columnas2);
    setColumnas2({...initialStateValues})
  }

  const handleInput = (e) => {
    const {value} = e.target;
    setColumnas2({...columnas2, nombre: value})
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
        <input type="text" value={columnas2.nombre} onChange={handleInput}/>
        <button>Añadir columna</button>
      </form>
    </div>
  );
}

export default Tablero;