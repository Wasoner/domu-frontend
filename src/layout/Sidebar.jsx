import { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Icon } from '../components';
import './Sidebar.scss';

const Sidebar = ({ navSections }) => {
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
                        className="app-sidebar__link app-sidebar__link--static"
                      >
                        <span aria-hidden="true" className="app-sidebar__icon">
                          {item.icon && <Icon name={item.icon} size={18} />}
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

Sidebar.propTypes = {
  navSections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          icon: PropTypes.string,
          to: PropTypes.string,
          exact: PropTypes.bool,
        })
      ),
    })
  ),
};

Sidebar.defaultProps = {
  navSections: [],
};

export default Sidebar;


