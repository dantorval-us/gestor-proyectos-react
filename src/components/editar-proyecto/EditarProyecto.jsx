import { useState, useEffect, useRef } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, TextareaAutosize } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import "./EditarProyecto.css"

function EditarProyecto ({ open, onClose, nombreProyecto, setNombreProyecto, descripcion, setDescripcion, updateNombreBD, updateDescripcionBD }) {

  const [nombre, setNombre] = useState(nombreProyecto);
  const [texto, setTexto] = useState(descripcion);
  const [editNombre, setEditNombre] = useState(false);
  const textFieldRef = useRef(null);

  useEffect(() => {
    setNombre(nombreProyecto);
  }, [open])

  useEffect(() => {
    if (editNombre && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [editNombre]);

  const updateNombre = (e) => {
    setNombre(e.target.value);
  };

  const updateDescripcion = async (e) => {
    setTexto(e.target.value);
  }

  const cambiarEditNombre = () => {
    setEditNombre(!editNombre);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
    setNombreProyecto(nombre)
    updateNombreBD(nombre);
    setDescripcion(texto);
    updateDescripcionBD(texto);
  };

  return (
    <>
      <Dialog
        maxWidth="xs"
        fullWidth
        open={open}
        onClose={(e)=> {
          onClose(); 
          e.stopPropagation();
          setEditNombre(false); 
        }}
      >
        <form onSubmit={handleSubmit} 
          onClick={(e) => e.stopPropagation()}
        >
          {!editNombre ?
            <DialogTitle className="nombre-proy-dialog" onClick={cambiarEditNombre}>
              {nombre}
              <EditIcon className="edit-icon-edit-proy"/>
            </DialogTitle>
          :
            <DialogTitle>
              <TextField
                className="textfield-edit-proy"
                value={nombre}
                onChange={updateNombre}
                inputRef={textFieldRef}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton color="primary" className="btn-cuadrado" 
                        onMouseDown={(e) => {
                          setNombre(nombre);
                          cambiarEditNombre();
                        }}
                      >
                        <CheckIcon className="check-icon-nueva-tarea"/>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </DialogTitle>
          }
          <DialogContent>
            <TextareaAutosize 
              className="text-area-desc"
              value={texto}
              minRows={3} 
              placeholder="Descripción"
              onChange={updateDescripcion}
              autoFocus 
            />
          </DialogContent>
          <DialogActions className="d-flex justify-content-between">
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default EditarProyecto;