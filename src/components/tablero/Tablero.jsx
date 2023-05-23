import "./Tablero.css"
import { useState } from "react";
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import Columna from "../columna/Columna";
import { columnasMock, tareasMock } from "../../mockData";

function Tablero() {

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

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

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
  };

  return (
    <div className="tablero-container">
    <h1>nombreProyecto mock</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columnas" direction="horizontal" type="columna">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="columnas-container"
            >
              {columnasMock.map((columna, index) => (
                <Columna
                  key={columna.id}
                  columna={columna}
                  tareas={columnasData[columna.id].tareas}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Tablero;