import React from "react";
import Tarea from "../tarea/Tarea";

function Columna() {
  return (
    <div className="columna-container">
      <h2>
        nombreColumna mock
      </h2>
      <div className="tareas-container">
        <Tarea />
      </div>
    </div>
  )
}

export default Columna;