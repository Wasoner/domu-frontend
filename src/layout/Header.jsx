import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/LogotipoDOMU.svg';
import { Button } from '../components';
import { ROUTES } from '../constants';
import './Header.scss';

const solucionesItems = [
  { label: 'Conserjería', route: ROUTES.SOLUCIONES_CONSERJERIA, icon: '🏢' },
  { label: 'Administrador', route: ROUTES.SOLUCIONES_ADMINISTRADOR, icon: '📊' },
  { label: 'Comité', route: ROUTES.SOLUCIONES_COMITE, icon: '🗳️' },
  { label: 'Residente', route: ROUTES.SOLUCIONES_RESIDENTE, icon: '🏠' },
  { label: 'Funcionarios', route: ROUTES.SOLUCIONES_FUNCIONARIOS, icon: '🏛️' },
];

const Header = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleResidentClick = () => {
    navigate(ROUTES.LOGIN);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Cerrar dropdown con Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

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
          
          {/* Dropdown Soluciones */}
          <div className="nav-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`nav-item dropdown-trigger ${isDropdownOpen ? 'is-open' : ''}`}
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              Soluciones
              <svg 
                className="dropdown-arrow" 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none"
                aria-hidden="true"
              >
                <path 
                  d="M2.5 4.5L6 8L9.5 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            <ul 
              className={`dropdown-menu ${isDropdownOpen ? 'is-visible' : ''}`}
              role="menu"
              aria-label="Soluciones por tipo de usuario"
            >
              {solucionesItems.map((item) => (
                <li key={item.route} role="none">
                  <Link
                    to={item.route}
                    className="dropdown-item"
                    role="menuitem"
                    onClick={closeDropdown}
                  >
                    <span className="dropdown-item-icon" aria-hidden="true">{item.icon}</span>
                    <span className="dropdown-item-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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
