import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import logo from '../assets/LogotipoDOMU.svg';
import { Icon } from '../components';
import { useAppContext } from '../context';
import { ROUTES } from '../constants';
import { getNotificationVisual } from '../constants/notifications';
import { useNotifications } from '../hooks/useNotifications';
import './AuthHeader.scss';

const AuthHeader = ({ user }) => {
  const navigate = useNavigate();
  const { selectBuilding } = useAppContext();
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const buildingRef = useRef(null);
  const helpRef = useRef(null);
  const notificationsRef = useRef(null);

  const buildingOptions = user?.buildings || [];
  const activeBuildingId = user?.selectedBuildingId || user?.activeBuildingId;
  const selectedBuilding = buildingOptions.find((b) => b.id === activeBuildingId) || buildingOptions[0];
  const buildingName = selectedBuilding?.name || 'Sin edificio';

  // Dirección corta: solo calle + comuna/ciudad
  const shortAddress = (() => {
    if (!selectedBuilding?.address) return '';
    const parts = selectedBuilding.address.split(',').map((p) => p.trim());
    const street = parts.slice(0, 2).join(', ');
    const city = selectedBuilding.city || selectedBuilding.commune || '';
    return city ? `${street}, ${city}` : street;
  })();

  const {
    notificationsPreview,
    unreadCount,
    markRead,
    hideNotifications,
  } = useNotifications(user);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

  const getNotificationDetail = (notification) => {
    return notification.detail || notification.message || '';
  };

  const getNotificationTime = (notification) => {
    return notification.timeLabel || formatRelativeTime(notification.date);
  };

  const handleNotificationClick = (notification) => {
    setShowNotificationsDropdown(false);
    markRead([notification.id]);
    if (notification.to) {
      navigate(notification.to);
    }
  };

  const handleViewAllNotifications = () => {
    setShowNotificationsDropdown(false);
    navigate(ROUTES.RESIDENT_PUBLICATIONS);
  };

  const handleClearVisible = () => {
    hideNotifications(notificationsPreview.map((item) => item.id));
  };

  useEffect(() => {
    if (!showNotificationsDropdown) return;
    const unreadIds = notificationsPreview
      .filter((item) => item.isUnread)
      .map((item) => item.id);
    if (unreadIds.length > 0) {
      markRead(unreadIds);
    }
  }, [showNotificationsDropdown, notificationsPreview, markRead]);

  // Asegurar que exista un building seleccionado para el header y la API
  useEffect(() => {
    if (buildingOptions.length === 0) return;
    const desiredBuildingId = user?.selectedBuildingId ?? user?.activeBuildingId ?? buildingOptions[0]?.id;
    if (desiredBuildingId === undefined || desiredBuildingId === null) return;
    if (user?.selectedBuildingId !== desiredBuildingId) {
      selectBuilding(desiredBuildingId);
    }
  }, [buildingOptions, user?.selectedBuildingId, user?.activeBuildingId, selectBuilding]);

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
              {shortAddress && (
                <span className="auth-header__building-address">{shortAddress}</span>
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
                        <span className="auth-header__building-option-address">
                          {(() => {
                            const pts = b.address.split(',').map((p) => p.trim());
                            const st = pts.slice(0, 2).join(', ');
                            const ct = b.city || b.commune || '';
                            return ct ? `${st}, ${ct}` : st;
                          })()}
                        </span>
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
          {unreadCount > 0 && (
            <span className="auth-header__badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {showNotificationsDropdown && (
            <div className="auth-header__dropdown auth-header__dropdown--right auth-header__dropdown--notifications">
              <div className="auth-header__dropdown-header">
                <span>Notificaciones</span>
                <div className="auth-header__dropdown-actions">
                  <button
                    type="button"
                    className="auth-header__dropdown-action auth-header__dropdown-action--muted"
                    onClick={handleClearVisible}
                    disabled={notificationsPreview.length === 0}
                  >
                    Limpiar visibles
                  </button>
                  <button
                    type="button"
                    className="auth-header__dropdown-action"
                    onClick={handleViewAllNotifications}
                  >
                    Ver todas
                  </button>
                </div>
              </div>
              <div className="auth-header__notifications-head" aria-hidden="true">
                <span>Tipo</span>
                <span>Detalle</span>
                <span>Fecha</span>
              </div>
              <div className="auth-header__notifications-list">
                {notificationsPreview.length > 0 ? (
                  notificationsPreview.map((notification) => {
                    const visual = getNotificationVisual(notification);
                    const detail = getNotificationDetail(notification);
                    const timeLabel = getNotificationTime(notification);
                    return (
                      <button
                        key={notification.id}
                        type="button"
                        className={`auth-header__notification ${notification.isUnread ? 'is-new' : 'is-read'}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="auth-header__notification-type">
                          <span
                            className="auth-header__notification-icon"
                            style={{ '--notif-color': visual.color, '--notif-bg': visual.bg }}
                            aria-hidden="true"
                          >
                            <Icon name={visual.icon} size={16} />
                          </span>
                          <span className="auth-header__notification-tag">{visual.tag}</span>
                        </div>
                        <div className="auth-header__notification-content">
                          <div className="auth-header__notification-title-row">
                            <span className="auth-header__notification-title">{notification.title}</span>
                            {notification.isUnread && <span className="auth-header__notification-dot" aria-hidden="true" />}
                          </div>
                          <span className="auth-header__notification-detail">{detail}</span>
                        </div>
                        <span className="auth-header__notification-time">{timeLabel}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="auth-header__notifications-empty">
                    No hay notificaciones nuevas
                  </div>
                )}
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
