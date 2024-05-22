import { useState } from "react";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import "./Proyecto.css"
import { db } from "../../firebase";
import MenuUD from "../menu-UD/MenuUD";
import EditarProyecto from "../editar-proyecto/EditarProyecto";

const Proyecto = ({ proyecto }) => {

  const [nombre, setNombre] = useState(proyecto.nombre);
  const [descripcion, setDescripcion] = useState(proyecto.descripcion);
  const proyectoRef = doc(db,  `proyectos/${proyecto.id}`);

  const updateNombreBD = async (nuevoNombre) => {
    await updateDoc(proyectoRef, {
      nombre: nuevoNombre,
    });
  }

  const updateDescripcionBD = async (nuevaDescripcion) => {
    await updateDoc(proyectoRef, {
      descripcion: nuevaDescripcion,
    });
  }

  const handleUpdate = async () => {
    handleClickOpen(); 
  }

  const deleteProyecto = async (id) => {
    const proyectoRef = doc(db, `proyectos/${id}`);
    await deleteDoc(proyectoRef);
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    deleteProyecto(proyecto.id);
  }

   /* Material UI Dialog */
   const [open, setOpen] = useState(false);

   const handleClickOpen = () => {
     setOpen(true);
   };
 
   const handleClose = () => {
     setOpen(false);
   };

  return (
    <>
      <div className="d-flex align-self-start">
        <span className="i">
          <ViewKanbanOutlinedIcon />&nbsp;&nbsp;
        </span>
        <div className="d-flex flex-column justify-content-center atrib-proy">
          <h2 className="h2-">{nombre}</h2>
          <p className="p-proyecto">{descripcion}</p>
        </div>
        <div className="ms-auto">
          <MenuUD
            vertical={false}
            onUpdate={handleUpdate} 
            onDelete={handleDelete}
          />
        </div>
      </div>

      <EditarProyecto 
        open={open}
        onClose={handleClose}
        nombreProyecto={nombre}
        setNombreProyecto={setNombre}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        updateNombreBD={updateNombreBD}
        updateDescripcionBD={updateDescripcionBD}
      />
    </>
  );
  
};

export default Proyecto;

