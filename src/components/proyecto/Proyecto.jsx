import "./Proyecto.css"
import { useState, useRef, useEffect } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import MenuUD from "../menu-UD/MenuUD";
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import { Box, Button, TextField } from "@mui/material";

const Proyecto = ({ proyecto }) => {

  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(proyecto.nombre);
  const inputRef = useRef(null);

  useEffect(() => {
    if (modoEdicion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modoEdicion]);

  const updateNombreBD = async (id, nuevoNombre) => {
    setModoEdicion(!modoEdicion);
    const proyectoRef = doc(db,  `proyectos/${id}`);
    await updateDoc(proyectoRef, {
      nombre: nuevoNombre,
    });
  }

  const updateNombre = async (e) => {
    setNombre(e.target.value);
  }

  const enterToUpdateNombre = async (e) => {
    if (e.key === 'Enter') {
      updateNombreBD(proyecto.id, nombre);
    }
  }

  const handleUpdate = async () => {
    setModoEdicion(!modoEdicion);
  }

  const deleteProyecto = async (id) => {
    const proyectoRef = doc(db, `proyectos/${id}`);
    await deleteDoc(proyectoRef);
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    deleteProyecto(proyecto.id);
  }

  const preventDefault = (e) => {
    e.preventDefault();
  }

  return (
    <div className="d-flex justify-content-between">
      {!modoEdicion ? 
      <div className="d-flex justify-content-between align-items-center">
        <span className="i">
          <ViewKanbanOutlinedIcon />&nbsp;&nbsp;
        </span>
        <h2 className="h2-">{nombre}</h2>
      </div>
      :
        <>
          <form>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <ViewKanbanOutlinedIcon sx={{ color: 'var(--secondary-color)', my: 0.8, mr: 1.5 }} />
              <TextField 
                variant="standard" 
                className="textfield-update-nombre"
                value={nombre}
                onClick={preventDefault}
                onChange={updateNombre}
                onKeyDown={enterToUpdateNombre}
                ref={inputRef}
              />
              <Button className="btn-update" onClick={(e) => {
                e.preventDefault();
                updateNombreBD(proyecto.id, nombre);
              }}>✓</Button>
            </Box>
          </form>
        </>
      }

      <MenuUD
        vertical={false}
        onUpdate={handleUpdate} 
        onDelete={handleDelete}
      />
    </div>
  );
  
};

export default Proyecto;

