import { useState } from "react";
import { addDoc, getDocs, collection } from "@firebase/firestore";
import { Box, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import "./NuevaTarea.css"
import { useDataContext } from "../../context/DataContext";

function NuevaTarea ({ columna, numTareas, tareasRef }) {
  const { db, setTareas } = useDataContext();
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
    setTareasAdd({...initialStateValuesTareas});
    // Actualizar estado de las tareas
    /* Lo hago así, aunque sea menos fluido, porque de otra forma
    (como en columnas) genera otros problemas de fluidez al mover las
    tareas entre columnas que solo he podido solucionar haciendolo asi */
    const nuevasTareas = await getUpdatedTareas();
    setTareas(nuevasTareas);
  };

  const handleInput = async (e) => {
    const {value} = e.target;
    setTareasAdd({...tareasAdd, nombreTarea: value});
  };

  const getUpdatedTareas = async () => {
    const snapshot = await getDocs(collection(db, 'tareas'));
    const updatedTareas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return updatedTareas;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tareasAdd.nombreTarea.trim()) {
      setTareasAdd({...tareasAdd, nombreTarea: ''});
      return; 
    };
    addTarea(tareasAdd);
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