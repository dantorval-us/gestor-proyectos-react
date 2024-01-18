import { useState } from "react";
import { auth, db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";
import { IconButton, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

const NuevoProyecto = () => {

  const proyectoRef = collection(db, 'proyectos');
  const initialStateValuesProyecto = {
    nombre: "",
    usuario: "",
  }
  const usuario = auth.currentUser;
  const [proyecto, setProyecto] = useState(initialStateValuesProyecto);
  
  const addProyecto = async proyecto => {
    proyecto.usuario = usuario.uid;
    await addDoc(proyectoRef, proyecto)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proyecto.nombre.trim()) {
      setProyecto({...proyecto, nombre: ''});
      return; 
    };
    addProyecto(proyecto);
    setProyecto({...initialStateValuesProyecto});
  }

  const handleInput = async (e) => {
    const {value} = e.target;
    setProyecto({nombre: value});
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
      <TextField 
        label="Crear nuevo tablero" 
        variant="standard" 
        placeholder="Nombre" 
        value={proyecto.nombre}
        onChange={handleInput}
      />
      <IconButton type="submit">
        <AddIcon />
      </IconButton>
    </form>
    </>
  );
  
};

export default NuevoProyecto;