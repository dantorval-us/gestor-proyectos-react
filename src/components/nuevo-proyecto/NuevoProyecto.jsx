import "./NuevoProyecto.css"
import { useState } from "react";
import { auth, db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, TextField } from "@mui/material";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

const NuevoProyecto = ({ open, onClose, numProyectos }) => {

  const proyectoRef = collection(db, 'proyectos');
  const initialStateValuesProyecto = {
    nombre: "",
    usuario: "",
  }
  const usuario = auth.currentUser;
  const [proyecto, setProyecto] = useState(initialStateValuesProyecto);
  const [campoTexto, setCampoTexto] = useState('');
  const [error, setError] = useState(false);

  const addProyecto = async proyecto => {
    proyecto.usuario = usuario.uid;
    await addDoc(proyectoRef, proyecto)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(campoTexto === '' ? true : false);
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
      {numProyectos!==0 &&
        <div id="crear-tablero-btn">
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <PlaylistAddIcon sx={{ color: 'active', my: 0.6 }} />
              <TextField 
                id="nuevo-tablero" 
                label="Crear nuevo tablero" 
                variant="standard" 
                className="textfield-label"
                placeholder="Nombre" 
                value={proyecto.nombre}
                onChange={handleInput}
              />
            </Box>
          </form>
        </div>
      }

      {/* Primer tablero */}
      {numProyectos===0 &&
        <div>
          <Dialog
            open={open}
            onClose={onClose}
          >
            <form onSubmit={handleSubmit}>
              <DialogContentText className="dialog-content-text">Un buen nombre debe ser corto y reflejar el propósito del tablero.</DialogContentText>
              <DialogContent>
                <TextField
                    autoFocus
                    required
                    label="Nombre del tablero"
                    fullWidth
                    variant="standard"
                    onChange={handleInput}
                    error={error}
                    helperText={error ? 'Debes escribir algo' : ''}
                  />
              </DialogContent>
              <DialogActions className="d-flex justify-content-between">
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="submit">Crear</Button>
              </DialogActions>
            </form>
          </Dialog>
        </div>
      }
    </>
  );
  
};

export default NuevoProyecto;