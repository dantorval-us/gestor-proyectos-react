import React, { useState, useEffect, useRef } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, TextareaAutosize } from "@mui/material";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import StyleIcon from '@mui/icons-material/Style';
import ImageIcon from '@mui/icons-material/Image';
import "./EditarTarea.css"
import puntosEstimacion from "../../assets/data/puntos-estimacion";

function EditarTarea ({ 
  open, onClose, 
  nombreTarea, setNombreTarea, updateNombreBD, 
  descripcion, setDescripcion, updateDescripcionBD,
  estimacionTarea, setEstimacionTarea, updateEstimacionBD
}) {

  const [nombre, setNombre] = useState(nombreTarea);
  const [texto, setTexto] = useState(descripcion);
  const [estimacion, setEstimacion] = useState(estimacionTarea);
  const [editNombre, setEditNombre] = useState(false);
  const [anchorElEstimacion, setAnchorElEstimacion] = useState(null);
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

  const handleUpdateNombre = (e) => {
    if (e.key === 'Enter' || e.type === 'mousedown') {
      e.preventDefault();
      setNombre(nombre);
      cambiarEditNombre();
    }
  }

  const updateDescripcion = async (e) => {
    setTexto(e.target.value);
  }

  const cambiarEditNombre = () => {
    setEditNombre(!editNombre);
  };

  const handleDesplegarEstimacion = (event) => {
    event.preventDefault()
    setAnchorElEstimacion(event.currentTarget);
  };

  const handleSetEstimacion = (e) => {
    const puntos = e.target.value
    setEstimacion(puntos);
    handleEstimacionClose();
  }
  
  const handleEstimacionClose = () => {
    setAnchorElEstimacion(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
    setNombreTarea(nombre)
    updateNombreBD(nombre);
    setDescripcion(texto);
    updateDescripcionBD(texto);
    setEstimacionTarea(estimacion);
    updateEstimacionBD(estimacion);
  };

  return (
    <>
      <Dialog
        // maxWidth="xs"
        maxWidth="sm"
        fullWidth
        open={open}
        onClose={(e)=> {
          onClose(); 
          e.stopPropagation();
          setEditNombre(false); 
          setTexto(descripcion);
          setEstimacion(estimacionTarea);
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
                onKeyDown={handleUpdateNombre}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton color="primary" className="btn-cuadrado" 
                        onMouseDown={handleUpdateNombre}
                      >
                        <CheckIcon className="check-icon-nueva-tarea"/>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </DialogTitle>
          }
          <DialogContent className="dc-tarea justify-content-between">

            <div className="dc-tarea-ppal">
              <div>
                <span>Descripción:</span>
                <TextareaAutosize 
                  className="textarea-descripcion"
                  value={texto}
                  minRows={3} 
                  placeholder="Añada una descripción más detallada..."
                  onChange={updateDescripcion}
                  autoFocus 
                />
              </div>
              <div className="d-flex">
                <span>Estimación:</span>
                {estimacion ?
                  <div className="estimacion-tarea" onClick={handleDesplegarEstimacion}>
                    {estimacion}
                  </div>
                :
                  <div className="estimacion-tarea-undefined" onClick={handleDesplegarEstimacion}>No definida.</div>
                }
              </div>
              <div className="d-flex">
                <span>Icono:</span>
                {/* {icono ?
                  <div>
                    {icono}
                  </div>
                : */}
                  <>No definido.</>
                {/* } */}
              </div>
            </div>

            <div className="dc-tarea-lateral">
              <span>Añadir a la tarjeta</span>
              <button
                onClick={handleDesplegarEstimacion}
              >
                <StyleIcon />
                Estimación
              </button>
              <button
                onClick={(e) => e.preventDefault()}
              >
                <ImageIcon />
                Icono
              </button>
            </div>
          </DialogContent>
          <DialogActions className="d-flex justify-content-between">
            <Button onClick={() => { 
              onClose(); 
              setEstimacion(estimacionTarea); 
            }}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogActions>
        </form> 
      </Dialog>

      <Menu
        anchorEl={anchorElEstimacion}
        open={Boolean(anchorElEstimacion)}
        onClose={handleEstimacionClose}
        className="menu-estimacion-tarea"
      >
        <span>¿Cómo de compleja es esta tarea?</span>
        {puntosEstimacion.map((item) => (
          [
            <hr key={item.id} />,
            <MenuItem value={item.puntos} onClick={handleSetEstimacion}>
              {item.puntos}
            </MenuItem>
          ]
        ))} 
      </Menu>
    </>
  );
}

export default EditarTarea;