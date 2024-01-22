import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import MenuUD from "../menu-UD/MenuUD";

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
    if (e.key == 'Enter') {
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
    <>
      {!modoEdicion ? 
        <h1>{nombre}</h1>
      :
        <>
          <input
            type="text"
            value={nombre}
            onClick={preventDefault}
            onChange={updateNombre}
            onKeyDown={enterToUpdateNombre}
            ref={inputRef}  
          />
          <button onClick={(e) => {
            e.preventDefault();
            updateNombreBD(proyecto.id, nombre);
          }}>✓</button>
        </>
      }

      <MenuUD 
        onUpdate={handleUpdate} 
        onDelete={handleDelete}
      />
    </>
  );
  
};

export default Proyecto;

