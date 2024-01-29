import "./NuevaTarea.css"
import { useState } from "react";
import { addDoc } from "@firebase/firestore";
import { Box, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

function NuevaTarea ({ columna, numTareas, tareasRef }) {

  const initialStateValuesTareas = {
    columna: "",
    nombreTarea: "",
    posicion: ""
  };

  const [tareasAdd, setTareasAdd] = useState(initialStateValuesTareas);

  const addTarea = async (tarea) => {
    tarea.columna = columna;
    tarea.posicion = await numTareas() + 1;
    await addDoc(tareasRef, tarea);
  };

  const handleInput = async (e) => {
    const {value} = e.target;
    setTareasAdd({...tareasAdd, nombreTarea: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tareasAdd.nombreTarea.trim()) {
      setTareasAdd({...tareasAdd, nombreTarea: ''});
      return; 
    };
    addTarea(tareasAdd);
    setTareasAdd({...initialStateValuesTareas});
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <AddIcon sx={{ my: 0.6 }} />
          <TextField 
            id="nueva-tarea" 
            label="Añadir tarea" 
            variant="standard" 
            className="textfield-label-tarea"
            placeholder="Nombre" 
            value={tareasAdd.nombreTarea}
            onChange={handleInput}
          />
        </Box>
      </form>
    </div>
  );

}

export default NuevaTarea;