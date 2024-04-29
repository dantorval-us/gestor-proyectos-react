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
import iconosTarea from "../../assets/data/iconos-tarea";
import Funcionalidad from "../../assets/images/icons/feature.png";
import Estilo from "../../assets/images/icons/pintar.png";
import Test from "../../assets/images/icons/test.png";
import Bug from "../../assets/images/icons/oruga.png";

function EditarTarea ({ 
  open, onClose, 
  nombreTarea, setNombreTarea, updateNombreBD, 
  descripcion, setDescripcion, updateDescripcionBD,
  estimacionTarea, setEstimacionTarea, updateEstimacionBD,
  iconoTarea, setIconoTarea, updateIconoBD,
  srcIconoTarea, setSrcIconoTarea
}) {

  const [nombre, setNombre] = useState(nombreTarea);
  const [texto, setTexto] = useState(descripcion);
  const [estimacion, setEstimacion] = useState(estimacionTarea);
  const [icono, setIcono] = useState(iconoTarea);
  const [srcIcono, setSrcIcono] = useState(srcIconoTarea);
  const [editNombre, setEditNombre] = useState(false);
  const [anchorElEstimacion, setAnchorElEstimacion] = useState(null);
  const [anchorElIcono, setAnchorElIcono] = useState(null);
  const textFieldRef = useRef(null);

  useEffect(() => {
    setSrcIcono(iconosTarea[icono]);
  }, [])

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

  const handleDesplegarIcono = (event) => {
    event.preventDefault()
    setAnchorElIcono(event.currentTarget);
  };

  const handleSetEstimacion = (e) => {
    const puntos = e.target.value
    setEstimacion(puntos);
    handleEstimacionClose();
  }

  const handleEstimacionClose = () => {
    setAnchorElEstimacion(null);
  };

  const handleSetIcono = (icono) => {
    setSrcIcono(iconosTarea[icono]);
    setIcono(icono);
    handleIconoClose();
  }

  const handleIconoClose = () => {
    setAnchorElIcono(null);
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
    setIconoTarea(icono);
    updateIconoBD(icono);
    setSrcIconoTarea(iconosTarea[icono]);
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
                />
              </div>
              <div className="d-flex">
                <span>Estimación:</span>
                {estimacion ?
                  <div className="estimacion-tarea" onClick={handleDesplegarEstimacion}>
                    {estimacion}
                  </div>
                :
                  <div className="atributo-tarea-undefined" onClick={handleDesplegarEstimacion}>No definida.</div>
                }
              </div>
              <div className="d-flex">
                <span>Icono:</span>
                {icono ?
                  <div className="icono-tarea" onClick={handleDesplegarIcono}>
                    <img src={srcIcono} alt={icono} className="icono-tarea"/>
                  </div>
                :
                  <div className="atributo-tarea-undefined" onClick={handleDesplegarIcono}>No definido.</div>
                }
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
                onClick={handleDesplegarIcono}
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
        className="menu-tarea"
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

      <Menu
        anchorEl={anchorElIcono}
        open={Boolean(anchorElIcono)}
        onClose={handleIconoClose}
        className="menu-tarea"
      >
        <span>Marca esta tarea con un icono</span>
        <hr />
        <MenuItem onClick={() => handleSetIcono(0)}>No marcar</MenuItem>
        <hr />
        <MenuItem onClick={() => handleSetIcono('Funcionalidad')}>
          <img src={Funcionalidad} alt="Funcionalidad" className="icono-tarea"/>
          Funcionalidad
        </MenuItem>
        <hr />
        <MenuItem onClick={() => handleSetIcono('Estilo')}>
          <img src={Estilo} alt="Estilo" className="icono-tarea"/>
          Estilo
        </MenuItem>
        <hr />
        <MenuItem onClick={() => handleSetIcono('Test')}>
          <img src={Test} alt="Test" className="icono-tarea"/>
          Test
        </MenuItem>
        <hr />
        <MenuItem onClick={() => handleSetIcono('Bug')}>
          <img src={Bug} alt="Bug" className="icono-tarea"/>
          Bug
        </MenuItem>
      </Menu>
    </>
  );
}

export default EditarTarea;