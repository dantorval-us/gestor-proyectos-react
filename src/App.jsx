import './App.css';
import { Routes, Route, useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { IoIosLogOut } from 'react-icons/io';
import Dashboard from './components/dashboard/Dashboard';
import Tablero from './components/tablero/Tablero';
import Login from './components/login/Login';
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from './components/ProtectedRoute';
import { auth } from './firebase';
import reactLogo from "./assets/images/react-logo.png";

function App() {

  const user = auth.currentUser;

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.setItem('user', null);
    await logout();
    navigate("/login");
  };

  const isLoginPage = useLocation().pathname=="/login" ? true : false;

  return (
    <div className="App">
      {!isLoginPage ?
      <header className="d-flex mb-3 align-items-center">
        <h1 className="p-2">
          <strong>
            Kanban B
            <span className="react-logo">
              <img src={reactLogo} />
            </span>
            ards
          </strong>
        </h1>
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
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute user={user} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/proyecto/:id" element={<Tablero />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
