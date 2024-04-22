import { useState } from "react";
import { addDoc, getDocs, collection } from "@firebase/firestore";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
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
  const [selectedTextField, setSelectedTextField] = useState(false);

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

  const handleFocus = () => {
    setSelectedTextField(true);
  };
  const handleBlur = () => {
    setSelectedTextField(false);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="crear-tarea-container">
          <TextField 
            id={`nueva-tarea-${columna}`}
            label={
              <div>
                  {!selectedTextField && <AddIcon />}
                  {!selectedTextField ? "Añadir tarea" : "Nombre de la tarea"}
              </div>
            }
            variant="standard" 
            className="textfield-label-tarea"
            value={tareasAdd.nombreTarea}
            onChange={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            InputProps={{
              endAdornment: selectedTextField && (
                <InputAdornment position="end">
                  <IconButton color="primary" className="btn-cuadrado" onMouseDown={handleSubmit}>
                    <CheckIcon className="check-icon-nueva-tarea"/>
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </div>
      </form>
    </div>
  );
}

export default NuevaTarea;