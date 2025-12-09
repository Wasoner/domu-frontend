import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/LogotipoDOMU.svg';
import { Button } from '../components';
import { ROUTES } from '../constants';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleResidentClick = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="app-header">
      <div className="header-inner container">
        <div className="brand-wrap">
          <Link to="/" className="brand-link" aria-label="DOMU - Ir al inicio">
            <span className="brand-logo" aria-hidden>
              <img src={logo} alt="DOMU - Software para administración de edificios" className="brand-img" />
            </span>
            <span className="brand-name">DOMU</span>
          </Link>
        </div>

        <nav className="main-nav" aria-label="Navegación principal">
          <Link to={ROUTES.HOME} className="nav-item">Inicio</Link>
          <Link to={ROUTES.ABOUT} className="nav-item">Acerca de</Link>
        </nav>

        <div className="header-actions">
          <Button onClick={handleResidentClick} variant="ghost" className="header-btn">
            Soy residente
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
