import "./Tablero.css"
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Columna from "../columna/Columna";
import { columnasMock, tareasMock } from "../../mockData";
import { useDataContext } from "../../context";

function Tablero() {

  const { columnas, tareas } = useDataContext();

  useEffect(() => {
    console.log('(TABLERO) Columnas:', columnas);
    console.log('(TABLERO) Tareas:', tareas);
  }, [columnas, tareas])

  // TAREAS
  const getTareasByColumnaId = (columnaId) => {
    return tareas.filter((tarea) => tarea.columna === columnaId);
  };

  const [columnasData, setColumnasData] = useState(
    columnas.reduce((data, columna) => {
      data[columna.id] = {
        id: columna.id,
        nombre: columna.nombre,
        tareas: getTareasByColumnaId(columna.id),
      };
      return data;
    }, {})
  );

  const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
  };

  // COLUMNAS

  /* v MOCK v */
  // TAREAS
  
  // COLUMNAS

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
  }

  return (
    <div className="tablero-container">
      <h1>nombreProyecto mock</h1>
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
                      {/* <Columna 
                        key={columna.id}
                        columna={columna} 
                        tareas={columnasData[columna.id].tareas}
                        index={index}
                      /> */}
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