import { useState, useEffect, useRef } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, TextareaAutosize } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import "./EditarTarea.css"

function EditarTarea ({ open, onClose, nombreTarea, setNombreTarea, updateNombreBD, descripcion, setDescripcion, updateDescripcionBD }) {

  const [nombre, setNombre] = useState(nombreTarea);
  const [texto, setTexto] = useState(descripcion);
  const [editNombre, setEditNombre] = useState(false);
  const textFieldRef = useRef(null);

  useEffect(() => {
    setNombre(nombreTarea);
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
    setNombreTarea(nombre)
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
            <DialogTitle className="nombre-tarea-dialog" onClick={cambiarEditNombre}>
              {nombre}
              <EditIcon className="edit-icon-edit-tarea"/>
            </DialogTitle>
          : 
            <DialogTitle>
              <TextField
                className="textfield-edit-tarea"
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
              className="textarea-descripcion"
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

export default EditarTarea;