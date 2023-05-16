import "./Tablero.css"
import Columna from "../columna/Columna";
import { columnasMock } from "../../mockData";

function Tablero() {
  return (
    <div className="tablero-container">
      <h1>nombreProyecto mock</h1>
      <div className="columnas-container">
        {columnasMock.map((columna) => (
          <Columna key={columna.id} id={columna.id} nombre={columna.nombre}/>
        ))}
      </div>
    </div>
  )
}

export default Tablero;