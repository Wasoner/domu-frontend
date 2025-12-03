import { NavLink } from 'react-router-dom';
import { ROUTES } from '../constants';
import './Sidebar.css';

const navSections = [
  {
    title: 'Inicio',
    items: [
      { label: 'Panel principal', icon: '🏠', to: ROUTES.RESIDENT_PORTAL },
      { label: 'Visitas', icon: '🧑‍🤝‍🧑', to: ROUTES.RESIDENT_EVENTS },
    ],
  },
  {
    title: 'Propiedad',
    items: [
      { label: 'Cartola', icon: '📄' },
      { label: 'Detalle gasto común', icon: '💳' },
      { label: 'Encomiendas', icon: '📦' },
      { label: 'Visitas', icon: '📋' },
      { label: 'Medidores', icon: '⚡' },
    ],
  },
  {
    title: 'Comunidad',
    items: [
      { label: 'Publicaciones', icon: '📰' },
      { label: 'Votaciones', icon: '🗳️' },
      { label: 'Egresos', icon: '💸' },
      { label: 'Incidentes', icon: '🚨' },
      { label: 'Fondos', icon: '🏦' },
      { label: 'Biblioteca', icon: '📚' },
    ],
  },
];

const Sidebar = () => {
  return (
    <aside className="app-sidebar" aria-label="Menú principal">
      <div className="app-sidebar__inner">
        {navSections.map((section) => (
          <div key={section.title} className="app-sidebar__section">
            <p className="app-sidebar__section-title">{section.title}</p>
            <nav>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    {item.to ? (
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `app-sidebar__link ${isActive ? 'is-active' : ''}`
                        }
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </NavLink>
                    ) : (
                      <button type="button" className="app-sidebar__link app-sidebar__link--static">
                        <span aria-hidden="true">{item.icon}</span>
                        {item.label}
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

