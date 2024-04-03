import "./Columna.css"
import Tarea from "../tarea/Tarea";
import { Droppable } from 'react-beautiful-dnd'

const Columna = ({ columna, tareas }) => {

  return (
    <div className="columna-container">
      <h2>{columna.nombre}</h2>
      <h4>{columna.id}</h4>
      <Droppable droppableId={columna.id} type="tarea">
        {(provided) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="tareas-container"
          >
            {tareas.map((tarea, index) => (
              <Tarea key={tarea.id} tarea={tarea} index={index}/>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Columna;