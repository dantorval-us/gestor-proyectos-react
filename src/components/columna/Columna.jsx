import "./Columna.css"
import Tarea from "../tarea/Tarea";
import { Droppable } from 'react-beautiful-dnd'

const Columna = ({ columna, tareas }) => {

  return (
    <div className="columna-container">
      <h2>{columna.nombre}</h2>
      <Droppable droppableId={columna.id} type="tarea">
        {(provided) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="tareas-container"
          >
            {tareas.sort((a, b) => a.posicion - b.posicion).map((tarea, index) =>  //REORDENA TAREAS ANTES DE RENDERIZARLAS
              {
                return <Tarea key={tarea.id} tarea={tarea} index={index}/>
              }
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Columna;
