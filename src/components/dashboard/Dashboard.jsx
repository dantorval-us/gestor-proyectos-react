import "./Dashboard.css"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { db } from "../../firebase";

function Dashboard() {

  const proyectosRef = collection(db, 'proyectos');
  const [proyectos, setProyectos] = useState([])
  const userId = localStorage.getItem('user').slice(1, -1); //slice para eliminar las comillas

  useEffect(() => {
    getProyectos();
  }, [userId]);

  const getProyectos = async () => {
    const q = query(proyectosRef, where("usuario", "==", userId), orderBy("nombre"))
    onSnapshot(q, (snapshot) => 
    setProyectos(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))))
  }

  return (
    <div className="proy-list">
      {proyectos.map((proyecto, index) => (
        <div key={proyecto.id}>
          <Link to={`/proyecto/${proyecto.id}`}>
            {/* <Proyecto /> */}
            {proyecto.nombre}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;