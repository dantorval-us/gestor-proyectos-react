import './App.css';
import { Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { IoIosLogOut } from 'react-icons/io';
import Dashboard from './components/dashboard/Dashboard';
import Tablero from './components/tablero/Tablero';
import Login from './components/login/Login';
import { AuthProvider, useAuth } from "./context/AuthContext";

function App() {

  const titulo = 'Gestor de proyectos';

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    //navigate("/login");
  };

  const isLoginPage = false;

  return (
    <div className="App">
      {!isLoginPage ?
      <header className="d-flex mb-3 align-items-center">
        <h1 className="p-2">{titulo}</h1>
        <Link to="/" className="p-2">Panel</Link>
        <span className="ms-auto p-2 desconectar" onClick={handleLogout}>
          <IoIosLogOut />&nbsp;<span>Desconectar</span>
        </span>
      </header>
      :
      <></>
      }

      <main>
        
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/proyecto/:id" element={<Tablero />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
      </main>
    </div>
  );
}

export default App;
