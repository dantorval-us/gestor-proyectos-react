import "./Tarea.css"
import { Draggable } from "react-beautiful-dnd";

const Tarea = ({ tarea, index }) => {
  return (
    <Draggable draggableId={tarea.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="tarjeta"
        >
          {tarea.nombreTarea}
        </div>
      )}
    </Draggable>
  );
};

export default Tarea;