import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import './Footer.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <Link to={ROUTES.HOME} className="app-footer__logo" aria-label="DOMU - Ir al inicio">
            DOMU
          </Link>
          <p className="app-footer__tagline">Software para la administración de edificios y condominios.</p>
        </div>
        <nav className="app-footer__nav" aria-label="Enlaces del sitio">
          <div className="app-footer__nav-group">
            <span className="app-footer__nav-title">Producto</span>
            <Link to={ROUTES.ABOUT}>Acerca de</Link>
            <Link to={ROUTES.SOLUCIONES}>Soluciones</Link>
            <Link to={ROUTES.CONTACT}>Contacto</Link>
          </div>
        </nav>
      </div>
      <div className="app-footer__bottom">
        <div className="app-footer__bottom-inner">
          <small>© {currentYear} DOMU. Todos los derechos reservados.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
