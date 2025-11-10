import { Link } from 'react-router-dom';
import logo from '../assets/LogotipoDOMU.svg';
import { ROUTES } from '../constants';
import './Header.css';

const Header = () => {

  return (
    <header className="app-header">
      <div className="header-inner container">
        <div className="brand-wrap">
          <Link to="/" className="brand-link" aria-label="Domu - Ir al inicio">
            <span className="brand-logo" aria-hidden>
              <img src={logo} alt="DOMU - Software para administración de edificios" className="brand-img" />
            </span>
          </Link>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          <Link to={ROUTES.HOME} className="nav-item">Inicio</Link>
          <Link to={ROUTES.ABOUT} className="nav-item">Acerca de</Link>
        </nav>

        <div className="header-actions">
          <Link to={ROUTES.LOGIN} className="btn btn-ghost">Iniciar sesión</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
