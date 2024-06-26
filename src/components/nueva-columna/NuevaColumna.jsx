import { useState } from "react";
import { addDoc, getDocs, query, where } from "@firebase/firestore";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

function NuevaColumna ({ open, onClose, proyecto, columnasRef }) {

  const initialStateValues = {
    nombre: "",
    posicion: "",
    proyecto: proyecto
  };
  
  const [columnasAdd, setColumnasAdd] = useState(initialStateValues);
  const [campoTexto, setCampoTexto] = useState('');
  const [error, setError] = useState(false);

  const addColumna = async (columna) => {
    columna.posicion = await getPosicion();
    await addDoc(columnasRef, columna);
  }

  const getPosicion = async () => {
    let pos = await getNumColumnas() + 1;
    return pos;
  }

  const getNumColumnas = async () => {
    const q = query(columnasRef, where("proyecto", "==", proyecto));
    const querySnapshot = await getDocs(q);
    const numColumnas = querySnapshot.size;
    return numColumnas;
  }

  const handleInput = (e) => {
    setCampoTexto(e.target.value.trim());
    const {value} = e.target;
    setColumnasAdd({...columnasAdd, nombre: value});
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(campoTexto === '' ? true : false);
    if (campoTexto !== '') {
      onClose();
      addColumna(columnasAdd); // persistir en BD
      setColumnasAdd({...initialStateValues}); // toma de datos del form
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Nueva columna</DialogTitle>
          <DialogContent>
            <TextField
                autoFocus
                required
                margin="dense"
                label="Nombre"
                fullWidth
                variant="standard"
                value={columnasAdd.nombre}
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
    </>
  );
}

export default NuevaColumna;