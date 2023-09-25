import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {

  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    localStorage.setItem('user', '...');
    navigate("/");
  }

  return (
    <div className="limiter">
      <div className="container-login100">
        <div className="wrap-login100">
          <div className="login100-form-title" 
            // style="background-image: url(assets/images/bg-01.jpg);"
          >
            <span className="login100-form-title-1">
              Organiza tus proyectos
            </span>
          </div>

          <h1>Mejora el rendimiento con una herramienta para la gestión visual de proyectos</h1>

          <div className="login">
            <p>Para continuar, inicia sesión.</p>
            <button className="btn-google" 
              onClick={handleGoogleLogin}
            >
              <span className="google-logo">
                {/* <img src="assets/images/google-logo.png"> */}
              </span>
              Continuar con Google
            </button>
          </div>
            
        </div>
      </div>
    </div>
  );
};

export default Login;