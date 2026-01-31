import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import logo from '../assets/LogotipoDOMU.svg';
import { useAppContext } from '../context';
import { ROUTES } from '../constants';
import './AuthHeader.scss';

const AuthHeader = ({ user }) => {
  const navigate = useNavigate();
  const { logout, selectBuilding } = useAppContext();
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const buildingRef = useRef(null);
  const helpRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const displayName = user?.firstName
    ? `${user.firstName} ${user?.lastName || ''}`.trim()
    : user?.email || 'Usuario Domu';
  const buildingOptions = user?.buildings || [];
  const activeBuildingId = user?.selectedBuildingId || user?.activeBuildingId;
  const selectedBuilding = buildingOptions.find((b) => b.id === activeBuildingId) || buildingOptions[0];
  const buildingName = selectedBuilding?.name || 'Sin edificio';
  const unitLabel = user?.unitId ? user.unitId : selectedBuilding?.id || '—';
  const roleLabel = user?.userType === 'admin'
    ? 'Administrador'
    : user?.userType === 'concierge'
      ? 'Conserje'
      : 'Residente';
  const userEmail = user?.email || '';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    navigate(ROUTES.RESIDENT_PROFILE);
    setShowProfileDropdown(false);
  };

  // Navegar al panel principal según el tipo de usuario
  const handleLogoClick = () => {
    if (user?.userType === 'admin') {
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.RESIDENT_PORTAL);
    }
  };

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buildingRef.current && !buildingRef.current.contains(event.target)) {
        setShowBuildingDropdown(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelpDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="auth-header" role="banner">
      <div className="auth-header__left">
        <img
          src={logo}
          alt="Logo DOMU"
          className="auth-header__logo auth-header__logo--clickable"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoClick();
            }
          }}
          aria-label="Volver al panel principal"
        />
        <div className="auth-header__brand">
          <div
            className={`auth-header__building-selector ${showBuildingDropdown ? 'auth-header__building-selector--open' : ''}`}
            ref={buildingRef}
            onClick={() => buildingOptions.length > 0 && setShowBuildingDropdown(!showBuildingDropdown)}
            role="button"
            aria-expanded={showBuildingDropdown}
            aria-haspopup="listbox"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                buildingOptions.length > 0 && setShowBuildingDropdown(!showBuildingDropdown);
              }
            }}
          >
            <div className="auth-header__building-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 21V8L12 3L21 8V21H15V14H9V21H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="auth-header__building-info">
              <span className="auth-header__building-name">{buildingName}</span>
              {selectedBuilding?.address && (
                <span className="auth-header__building-address">{selectedBuilding.address}</span>
              )}
            </div>
            {buildingOptions.length > 1 && (
              <svg
                className={`auth-header__chevron ${showBuildingDropdown ? 'auth-header__chevron--open' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {showBuildingDropdown && buildingOptions.length > 0 && (
              <div className="auth-header__dropdown auth-header__dropdown--buildings" role="listbox">
                <div className="auth-header__dropdown-header">
                  <span>Seleccionar comunidad</span>
                  <span className="auth-header__dropdown-count">{buildingOptions.length}</span>
                </div>
                {buildingOptions.map((b) => (
                  <div
                    key={b.id}
                    className={`auth-header__building-option ${b.id === selectedBuilding?.id ? 'auth-header__building-option--active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectBuilding(b.id);
                      setShowBuildingDropdown(false);
                    }}
                    role="option"
                    aria-selected={b.id === selectedBuilding?.id}
                  >
                    <div className="auth-header__building-option-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 21V8L12 3L21 8V21H15V14H9V21H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="auth-header__building-option-info">
                      <span className="auth-header__building-option-name">{b.name}</span>
                      {b.address && (
                        <span className="auth-header__building-option-address">{b.address}</span>
                      )}
                      {b.commune && (
                        <span className="auth-header__building-option-commune">{b.commune}{b.city ? `, ${b.city}` : ''}</span>
                      )}
                    </div>
                    {b.id === selectedBuilding?.id && (
                      <span className="auth-header__building-option-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="auth-header__right">
        <div
          className="auth-header__icon-button"
          ref={helpRef}
          onClick={() => setShowHelpDropdown(!showHelpDropdown)}
          aria-label="Ayuda"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7.5 7.5C7.5 6.11929 8.61929 5 10 5C11.3807 5 12.5 6.11929 12.5 7.5C12.5 8.38071 12.0523 9.14286 11.4 9.6C10.7477 10.0571 10.5 10.6193 10.5 11V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="13.5" r="0.75" fill="currentColor" />
          </svg>
          {showHelpDropdown && (
            <div className="auth-header__dropdown auth-header__dropdown--right">
              <div className="auth-header__dropdown-item">Centro de ayuda</div>
              <div className="auth-header__dropdown-item">Contactar soporte</div>
              <div className="auth-header__dropdown-item">Preguntas frecuentes</div>
            </div>
          )}
        </div>

        <div
          className="auth-header__icon-button"
          ref={notificationsRef}
          onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
          aria-label="Notificaciones"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3C7.23858 3 5 5.23858 5 8V11.5858C5 12.1162 4.78929 12.625 4.41421 13L3 14.4142V15H17V14.4142L15.5858 13C15.2107 12.625 15 12.1162 15 11.5858V8C15 5.23858 12.7614 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 15V16C7 17.6569 8.34315 19 10 19C11.6569 19 13 17.6569 13 16V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="auth-header__badge">9+</span>
          {showNotificationsDropdown && (
            <div className="auth-header__dropdown auth-header__dropdown--right">
              <div className="auth-header__dropdown-header">Notificaciones</div>
              <div className="auth-header__dropdown-item">Nueva visita registrada</div>
              <div className="auth-header__dropdown-item">Pago recibido</div>
              <div className="auth-header__dropdown-item">Mensaje del administrador</div>
              <div className="auth-header__dropdown-footer">Ver todas</div>
            </div>
          )}
        </div>

        <div
          className="auth-header__icon-button"
          ref={profileRef}
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          aria-label="Perfil"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 17C5 14.2386 7.23858 12 10 12C12.7614 12 15 14.2386 15 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {showProfileDropdown && (
            <div className="auth-header__dropdown auth-header__dropdown--right">
              <div className="auth-header__dropdown-header">
                <div className="auth-header__profile-info">
                  <div className="auth-header__profile-name">{displayName}</div>
                  <div className="auth-header__profile-role">{roleLabel}</div>
                  {userEmail && (
                    <div className="auth-header__profile-email">{userEmail}</div>
                  )}
                </div>
              </div>
              <div
                className="auth-header__dropdown-item"
                onClick={handleProfileClick}
              >
                Mi perfil
              </div>
              <div className="auth-header__dropdown-item">Configuración</div>
              <div
                className="auth-header__dropdown-item auth-header__dropdown-item--danger"
                onClick={handleLogout}
              >
                Cerrar sesión
              </div>
            </div>
          )}
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



