import "./NuevoProyecto.css"
import { useState } from "react";
import { auth, db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, InputAdornment, TextField } from "@mui/material";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CheckIcon from '@mui/icons-material/Check';

const NuevoProyecto = ({ open, onClose, numProyectos }) => {

  const proyectoRef = collection(db, 'proyectos');
  const initialStateValuesProyecto = {
    nombre: "",
    usuario: "",
  }
  const usuario = auth.currentUser;
  const [proyecto, setProyecto] = useState(initialStateValuesProyecto);
  const campoTexto = '';
  const [error, setError] = useState(false);
  const [selectedTextField, setSelectedTextField] = useState(false);

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

  const handleFocus = () => {
    setSelectedTextField(true);
  };

  const handleBlur = () => {
    setSelectedTextField(false);
  };

  return (
    <>
      {numProyectos!==0 &&
        <div id="crear-tablero-btn">
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField 
                id="nuevo-tablero" 
                label={
                  <div>
                      {!selectedTextField && <PlaylistAddIcon />}
                      {!selectedTextField ? "Crear nuevo tablero" : "Nombre del tablero"}
                  </div>
                }
                variant="standard" 
                className="textfield-label"
                value={proyecto.nombre}
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