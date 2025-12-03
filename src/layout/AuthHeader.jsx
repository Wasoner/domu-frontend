import PropTypes from 'prop-types';
import logo from '../assets/LogotipoDOMU.svg';
import './AuthHeader.css';

const AuthHeader = ({ user }) => {
  const displayName = user?.firstName
    ? `${user.firstName} ${user?.lastName || ''}`.trim()
    : user?.email || 'Usuario Domu';
  const roleLabel = user?.userType === 'admin'
    ? 'Administrador'
    : user?.userType === 'concierge'
      ? 'Conserje'
      : 'Residente';
  const unitLabel = user?.unitId
    ? `Unidad ${user.unitId}`
    : 'Unidad 1502';

  return (
    <header className="auth-header" role="banner">
      <div className="auth-header__brand">
        <img src={logo} alt="Logo DOMU" className="auth-header__logo" />
        <div>
          <strong>Comunidad DOMU</strong>
          <span>Edificio Orompello · Concepción</span>
        </div>
      </div>

      <div className="auth-header__status">
        <p className="auth-header__status-title">Tus cuentas están al día</p>
        <span>Último pago: 24-11-2025 · Próximo pago: 30-11-2025</span>
      </div>

      <div className="auth-header__actions">
        <button type="button" className="auth-header__action">Enviar mensaje al administrador</button>
        <button type="button" className="auth-header__action">Información para pagar</button>
        <button type="button" className="auth-header__action auth-header__action--primary">+ Registrar visita</button>
      </div>

      <div className="auth-header__profile">
        <div className="auth-header__avatar" aria-hidden="true">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <strong>{displayName}</strong>
          <span>{roleLabel} · {unitLabel}</span>
        </div>
      </div>
    </header>
  );
};

AuthHeader.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    userType: PropTypes.string,
    unitId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

AuthHeader.defaultProps = {
  user: null,
};

export default AuthHeader;

