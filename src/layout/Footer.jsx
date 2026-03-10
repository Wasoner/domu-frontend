import { Link } from 'react-router-dom';
import { Icon } from '../components';
import { ROUTES } from '../constants';
import './Footer.scss';

const footerLinks = [
  { to: ROUTES.ABOUT, label: 'Acerca de', icon: 'info' },
  { to: ROUTES.SOLUCIONES, label: 'Soluciones', icon: 'sparkles' },
  { to: ROUTES.CONTACT, label: 'Contacto', icon: 'chatBubbleLeftRight' },
];

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
            {footerLinks.map(({ to, label, icon }) => (
              <Link key={to} to={to} className="app-footer__link">
                <Icon name={icon} size={18} className="app-footer__link-icon" />
                {label}
              </Link>
            ))}
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
