import { useNavigate, useLocation, NavLink } from "react-router-dom";
import "./navBar.css";

const LOGO_URL = "https://www.rioverde.go.gov.br/wp-uploads/2025/02/logo-rioverdebranca.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiration");
    navigate("/");
  };

  const hiddenRoutes = ["/login", "/cadastro", "/sucessoCadastro"];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const getNavLinkClass = ({ isActive }) => {
    return `navbar-link${isActive ? " active" : ""}`;
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <NavLink
          to="/home"
          className="navbar-logo-group-link"
          aria-label="Página inicial Esporte+"
        >
          <div className="navbar-logo-group">
            <img
              src={LOGO_URL}
              alt="Logo Prefeitura de Rio Verde"
              className="navbar-logo"
            />
            <h1 className="navbar-title">Esporte+</h1>
          </div>
        </NavLink>

        <nav className="navbar-nav">
          <NavLink
            to="/quadras"
            className={getNavLinkClass}
          >
            Quadras
          </NavLink>
          <NavLink
            to="/listar"
            className={getNavLinkClass}
          >
            Agendamentos
          </NavLink>
          <NavLink
            to="/perfil"
            className={getNavLinkClass}
          >
            Perfil
          </NavLink>
          <button
            onClick={handleLogout}
            className="navbar-logout-button"
            aria-label="Sair da conta"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;