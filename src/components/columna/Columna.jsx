import "./Columna.css"
import { deleteDoc, doc } from "firebase/firestore";
//import Tarea from "../tarea/Tarea";
//import { Droppable } from 'react-beautiful-dnd'

import { db } from "../../firebase";

const Columna = ({ columna, tareas }) => {

  const deleteColumna = async (id) => {
    const columnaRef = doc(db, `columnas/${id}`);
    await deleteDoc(columnaRef);
    console.log("Columna eliminada")
  }

  return (
    <div className="columna-container">
      <h2>{columna.nombre}</h2>
      <button onClick={() => deleteColumna(columna.id)}>X</button>
      {/* <Droppable droppableId={columna.id} type="tarea">
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
      </Droppable> */}
    </div>
  );
};

export default Columna;