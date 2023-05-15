import React from "react";
import Columna from "../columna/Columna";

function Tablero() {
  return (
    <div className="tablero-container">
      <h1>nombreProyecto mock</h1>
      <div className="columnas-container">
        <Columna />
      </div>
    </div>
  )
}

export default Tablero;