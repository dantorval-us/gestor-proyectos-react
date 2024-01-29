import "./Dashboard.css"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { db } from "../../firebase";
import Proyecto from "../proyecto/Proyecto";
import NuevoProyecto from "../nuevo-proyecto/NuevoProyecto";
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import { Button } from "@mui/material";

function Dashboard() {

  const proyectosRef = collection(db, 'proyectos');
  const [proyectos, setProyectos] = useState([])
  const userId = localStorage.getItem('user').slice(1, -1); //slice para eliminar las comillas
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProyectos();
  }, [userId]);

  const getProyectos = async () => {
    const q = query(proyectosRef, where("usuario", "==", userId), orderBy("nombre"))
    onSnapshot(q, (snapshot) => {
      setProyectos(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    });
  };

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
      <div className="d-flex dashboard-container">
        <div className="proy-list">
          {proyectos.map((proyecto, index) => (
            <div key={proyecto.id}>
              <Link to={`/proyecto/${proyecto.id}`} className="a">
                  <Proyecto key={proyecto.id} proyecto={proyecto}/>
              </Link>
            </div>
          ))}
        </div>
        <div className="nuevo-tablero">
          <NuevoProyecto 
            open={open}
            onClose={handleClose}
            numProyectos={proyectos.length}
          />
        </div>
      </div>

      {/* Dashboard vacio */}
      {!loading && proyectos.length===0 && (
        <div className="dashboard-vacio">
          <Button 
            className="btn-dashboard-vacio"
            variant="contained" 
            onClick={handleClickOpen}
          >
            <ViewKanbanOutlinedIcon className="icon-crear-tablero" sx={{ color: 'var(--secondary-color)'}} />
            <h1 className="h1-crear-tablero">Crear tablero</h1>
            <h3 className="h3-crear-tablero">Cree un tablero para empezar a gestionar su proyecto</h3>
          </Button>
        </div>
      )}
    </>
  );
};

export default Dashboard;