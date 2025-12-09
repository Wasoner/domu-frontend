import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../constants';
import './Sidebar.css';

const navSections = [
  {
    title: 'Inicio',
    items: [
      { label: 'Panel principal', icon: '🏠', to: ROUTES.RESIDENT_PORTAL, exact: true },
      { label: 'Visitas', icon: '🧑‍🤝‍🧑', to: ROUTES.RESIDENT_EVENTS },
    ],
  },
  {
    title: 'Propiedad',
    items: [
      { label: 'Cartola', icon: '📄' },
      { label: 'Detalle gasto común', icon: '💳' },
      { label: 'Encomiendas', icon: '📦' },
      { label: 'Medidores', icon: '⚡' },
    ],
  },
  {
    title: 'Comunidad',
    items: [
      { label: 'Publicaciones', icon: '📰' },
      { label: 'Votaciones', icon: '🗳️' },
      { label: 'Egresos', icon: '💸' },
      { label: 'Incidentes', icon: '🚨', to: ROUTES.RESIDENT_INCIDENTS },
      { label: 'Fondos', icon: '🏦' },
      { label: 'Biblioteca', icon: '📚' },
    ],
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}
      aria-label="Menú principal"
    >
      <div className="app-sidebar__header">
        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        >
          <span className="app-sidebar__hamburger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="app-sidebar__toggle-text">
            {isCollapsed ? 'Expandir' : 'Contraer'}
          </span>
        </button>
      </div>
      <div className="app-sidebar__inner">
        {navSections.map((section) => (
          <div key={section.title} className="app-sidebar__section">
            <p className="app-sidebar__section-title">{section.title}</p>
            <nav>
              <ul className="app-sidebar__list">
                {section.items.map((item) => (
                  <li key={item.label} className="app-sidebar__item">
                    {item.to ? (
                      <NavLink
                        to={item.to}
                        end={item.exact}
                        title={item.label}
                        className={({ isActive }) =>
                          `app-sidebar__link ${isActive ? 'is-active' : ''}`
                        }
                      >
                        <span aria-hidden="true" className="app-sidebar__icon">
                          {item.icon}
                        </span>
                        <span className="app-sidebar__link-label">{item.label}</span>
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        title={item.label}
                        className="app-sidebar__link app-sidebar__link--static"
                      >
                        <span aria-hidden="true" className="app-sidebar__icon">
                          {item.icon}
                        </span>
                        <span className="app-sidebar__link-label">{item.label}</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;



