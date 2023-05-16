import "./Columna.css"
import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import Tarea from "../tarea/Tarea";
import { tareasMock } from '../../mockData'

const reorder = (list, startIndex, endIndex) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function Columna({ id, nombre }) {
  const tareasColumna = tareasMock.filter((tarea) => tarea.columna === id);
  const [tasks, setTasks] = useState(tareasColumna);
  return (
    <DragDropContext
      onDragEnd={(result) => {
        const { source, destination } = result;
        if (!destination) {
          return;
        }
        if (
          source.index === destination.index &&
          source.droppableId === destination.droppableId
        ) {
          return;
        }

        setTasks((prevTasks) =>
          reorder(prevTasks, source.index, destination.index)
        );
      }}
    >
      <div className="columna-container">
        <h2>{nombre}</h2>
        <Droppable droppableId="tasks">
          {(droppableProvided) => (
            <ul
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
              className="task-container"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(draggableProvided) => (
                    <li
                      {...draggableProvided.draggableProps}
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.dragHandleProps}
                      className="task-item"
                    >
                      {task.nombre}
                    </li>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </ul>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}


    // <div className="columna-container">
    //   <h2>
    //     nombreColumna mock
    //   </h2>
    //   <div className="tareas-container">
    //     <Tarea />
    //   </div>
    // </div>

export default Columna;