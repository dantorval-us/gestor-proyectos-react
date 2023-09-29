import { useState } from "react";
import { auth, db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";

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
    if (!proyecto.nombre.trim()) { return; };
    addProyecto(proyecto);
    setProyecto({...initialStateValuesProyecto});
  }

  const handleInput = async (e) => {
    const {value} = e.target;
    setProyecto({nombre: value});
  }

  return (
    <>
    <br />
    <form onSubmit={handleSubmit}>
      <input type="text" value={proyecto.nombre} onChange={handleInput}/>
      <button>+ Crear nuevo tablero</button>
    </form>
    </>
  );
  
};

export default NuevoProyecto;