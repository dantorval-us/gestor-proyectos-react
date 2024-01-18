import { useState } from "react";
import { addDoc } from "@firebase/firestore";
import { IconButton, TextField } from "@mui/material";
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
    <>
      <form onSubmit={handleSubmit}>
        <TextField 
          label="Añadir tarea" 
          variant="standard" 
          placeholder="Nombre" 
          value={tareasAdd.nombreTarea}
          onChange={handleInput}
        />
        <IconButton type="submit">
          <AddIcon />
        </IconButton>
      </form>
    </>
  );

}

export default NuevaTarea;