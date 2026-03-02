import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components';
import { ROUTES } from '../constants';
import { useAppContext } from '../context';
import './Sidebar.scss';

// Persiste entre remontajes del componente
let savedScrollTop = 0;

const Sidebar = ({ navSections, user }) => {
  const navigate = useNavigate();
  const { logout } = useAppContext();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const safeNavSections = Array.isArray(navSections) ? navSections : [];

  const [expandedItems, setExpandedItems] = useState(() => {
    const initial = {};
    safeNavSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.subItems) {
          const hasActiveChild = item.subItems.some((sub) => window.location.pathname === sub.to);
          if (hasActiveChild) {
            initial[item.label] = true;
          }
        }
      });
    });
    return initial;
  });

  const displayName = useMemo(() => (
    user?.firstName
      ? `${user.firstName} ${user?.lastName || ''}`.trim()
      : user?.email || 'Mi perfil'
  ), [user]);

  const initials = useMemo(() => {
    const first = user?.firstName?.trim()?.[0];
    const last = user?.lastName?.trim()?.[0];
    if (first || last) return `${first || ''}${last || ''}`.toUpperCase();
    if (user?.email) return user.email.trim()[0].toUpperCase();
    return 'D';
  }, [user]);

  const avatarUrl = user?.avatarBoxId || '';
  const innerRef = useRef(null);

  // Restaurar posición de scroll al montar
  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.scrollTop = savedScrollTop;
    }
  }, []);

  const handleInnerScroll = useCallback(() => {
    savedScrollTop = innerRef.current?.scrollTop || 0;
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Auto-expand sections al navegar a una ruta hija (solo cuando cambia la ruta, no al colapsar)
  useEffect(() => {
    setExpandedItems((prev) => {
      const newExpanded = { ...prev };
      let changed = false;

      safeNavSections.forEach((section) => {
        section.items.forEach((item) => {
          if (item.subItems) {
            const hasActiveChild = item.subItems.some((sub) => location.pathname === sub.to);
            if (hasActiveChild && !prev[item.label]) {
              newExpanded[item.label] = true;
              changed = true;
            }
          }
        });
      });

      return changed ? newExpanded : prev;
    });
  }, [location.pathname, safeNavSections]);

  const toggleExpand = (e, label) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}
      aria-label="Menú principal"
    >
      <div className="app-sidebar__inner" ref={innerRef} onScroll={handleInnerScroll}>
        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        >
          <span className="app-sidebar__toggle-icon" aria-hidden="true">
            {isCollapsed ? (
              <Icon name="chevronRight" size={18} />
            ) : (
              <Icon name="chevronRight" size={18} style={{ transform: 'rotate(180deg)' }} />
            )}
          </span>
        </button>
        {safeNavSections.map((section) => (
          <div key={section.title} className="app-sidebar__section">
            <p className="app-sidebar__section-title">{section.title}</p>
            <nav>
              <ul className="app-sidebar__list">
                {section.items.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedItems[item.label];
                  const isAnySubActive = hasSubItems && item.subItems.some(sub => location.pathname === sub.to);

                  return (
                    <li key={item.label} className={`app-sidebar__item ${hasSubItems ? 'has-subitems' : ''}`}>
                      {item.to ? (
                        <NavLink
                          to={item.to}
                          end={item.exact !== undefined ? item.exact : true}
                          title={item.label}
                          className={({ isActive }) =>
                            `app-sidebar__link ${isActive ? 'is-active' : ''}`
                          }
                        >
                          <span aria-hidden="true" className="app-sidebar__icon">
                            {item.icon && <Icon name={item.icon} size={18} />}
                          </span>
                          <span className="app-sidebar__link-label">{item.label}</span>
                        </NavLink>
                      ) : (
                        <button
                          type="button"
                          title={item.label}
                          className={`app-sidebar__link ${hasSubItems ? 'app-sidebar__link--collapsible' : 'app-sidebar__link--static'} ${isExpanded ? 'is-expanded' : ''} ${isAnySubActive ? 'is-child-active' : ''}`}
                          onClick={hasSubItems ? (e) => toggleExpand(e, item.label) : undefined}
                        >
                          <span aria-hidden="true" className="app-sidebar__icon">
                            {item.icon && <Icon name={item.icon} size={18} />}
                          </span>
                          <span className="app-sidebar__link-label">{item.label}</span>
                          {hasSubItems && !isCollapsed && (
                            <span className="app-sidebar__chevron">
                              <Icon name="chevronDown" size={14} />
                            </span>
                          )}
                        </button>
                      )}

                      {hasSubItems && isExpanded && !isCollapsed && (
                        <ul className="app-sidebar__sublist">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.label} className="app-sidebar__subitem">
                              <NavLink
                                to={subItem.to}
                                end={subItem.exact !== undefined ? subItem.exact : true}
                                className={({ isActive }) =>
                                  `app-sidebar__sublink ${isActive ? 'is-active' : ''}`
                                }
                              >
                                <span className="app-sidebar__sublink-label">{subItem.label}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        ))}
      </div>
      <div className="app-sidebar__profile">
        <NavLink
          to={ROUTES.RESIDENT_PROFILE}
          className={({ isActive }) =>
            `app-sidebar__profile-card ${isActive ? 'is-active' : ''}`
          }
          aria-label="Ir a mi perfil"
        >
          <div className="app-sidebar__profile-avatar" aria-hidden="true">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <span className="app-sidebar__profile-name">{displayName}</span>
        </NavLink>
        <button
          type="button"
          className="app-sidebar__profile-logout"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <Icon name="door" size={16} />
          <span className="app-sidebar__profile-logout-label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    avatarBoxId: PropTypes.string,
  }),
  navSections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          icon: PropTypes.string,
          to: PropTypes.string,
          exact: PropTypes.bool,
          subItems: PropTypes.arrayOf(
            PropTypes.shape({
              label: PropTypes.string.isRequired,
              to: PropTypes.string.isRequired,
              exact: PropTypes.bool,
            })
          ),
        })
      ),
    })
  ),
};

Sidebar.defaultProps = {
  navSections: [],
  user: null,
};

export default Sidebar;
