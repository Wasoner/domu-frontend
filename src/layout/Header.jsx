import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/LogotipoDOMU.png';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-inner container">
        <div className="brand-wrap">
          <Link to="/" className="brand-link">
            <span className="brand-logo" aria-hidden>
              <img src={logo} alt="DOMU logo" className="brand-img" />
            </span>
          </Link>
        </div>

        <nav className="main-nav">
          <Link to="/features" className="nav-item">Funcionalidades</Link>
          <Link to="/ecosistema" className="nav-item">Ecosistema</Link>
          <Link to="/eventos" className="nav-item">Eventos</Link>
          <Link to="/recursos" className="nav-item">Recursos</Link>
        </nav>

        <div className="header-actions">
          <Link to="/cotizar" className="btn btn-ghost">Cotizar</Link>
          <Link to="/pago" className="btn btn-ghost">Pago fácil</Link>
          <Link to="/login" className="btn btn-primary">Iniciar sesión</Link>
        </div>
      </div>
      <div className="separator sep-header" aria-hidden />
    </header>
  );
};

export default Header;
