import { Navigate, Outlet } from "react-router-dom";

const userGuardado = localStorage.getItem('user');

export const ProtectedRoute = ({ user }) => {
  
  if ((userGuardado==="undefined" || userGuardado===null || userGuardado==="null") && !user) {
    return <Navigate to={"/login"} />;
  }

  return <Outlet />;
};