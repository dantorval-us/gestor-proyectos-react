import "./Columna.css"
import { Droppable } from 'react-beautiful-dnd'
import Tarea from "../tarea/Tarea";

const Columna = ({ columna, tareas }) => {
  return (
    <div className="columna-container">
      <h2>{columna.nombre}</h2>
      <Droppable droppableId={columna.id} type="tarea">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="task-container">
            {tareas.map((tarea, index) => (
              <Tarea key={tarea.id} tarea={tarea} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Columna;