import "./Tarea.css"
import { Draggable } from "react-beautiful-dnd";

const Tarea = ({ tarea, index }) => {
  return (
    <Draggable draggableId={tarea.id} index={index}>
      {(provided) => (
        <div
          className="task-item"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {tarea.nombre}
        </div>
      )}
    </Draggable>
  );
};

export default Tarea;