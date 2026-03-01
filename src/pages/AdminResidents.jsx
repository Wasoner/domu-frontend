import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './AdminResidents.scss';

/**
 * Iconos de roles
 */
const ROLE_ICONS = {
  Administrador: 'crown',
  Residente: 'home',
  Conserje: 'key',
  Personal: 'wrench',
  Usuario: 'user',
};

/**
 * Colores de roles
 */
const ROLE_COLORS = {
  Administrador: 'var(--color-warning)',
  Residente: 'var(--color-turquoise)',
  Conserje: 'var(--color-info)',
  Personal: 'var(--color-gray)',
  Usuario: 'var(--color-gray-dark)',
};

/**
 * Tarjeta de residente
 */
const ResidentCard = ({ resident }) => {
  const roleIcon = ROLE_ICONS[resident.roleName] || ROLE_ICONS.Usuario;
  const roleColor = ROLE_COLORS[resident.roleName] || ROLE_COLORS.Usuario;

  return (
    <div className="resident-card">
      <div className="resident-card__avatar" style={{ '--role-color': roleColor }}>
        <span>{resident.firstName?.charAt(0)}{resident.lastName?.charAt(0)}</span>
      </div>
      <div className="resident-card__info">
        <div className="resident-card__name">
          {resident.firstName} {resident.lastName}
        </div>
        <div className="resident-card__details">
          <span className="resident-card__role" style={{ color: roleColor }}>
            <Icon name={roleIcon} size={14} /> {resident.roleName}
          </span>
          {resident.resident && (
            <span className="resident-card__badge">Residente</span>
          )}
        </div>
        <div className="resident-card__contact">
          <a href={`mailto:${resident.email}`} className="resident-card__email">
            {resident.email}
          </a>
          {resident.phone && (
            <span className="resident-card__phone">{resident.phone}</span>
          )}
        </div>
      </div>
      <div className="resident-card__status">
        <span className={`resident-card__status-badge resident-card__status-badge--${resident.status?.toLowerCase() || 'active'}`}>
          {resident.status === 'ACTIVE' ? 'Activo' : resident.status}
        </span>
      </div>
    </div>
  );
};

/**
 * Sección de unidad con sus residentes
 */
const UnitSection = ({ unitNumber, tower, floor, residents, isExpanded, onToggle }) => {
  const unitLabel = useMemo(() => {
    if (!unitNumber && !tower && !floor) {
      return 'Sin unidad asignada';
    }
    const safeNumber = unitNumber ? `Unidad ${unitNumber}` : 'Unidad sin número';
    let label = safeNumber;
    if (tower) label += ` - Torre ${tower}`;
    if (floor) label += ` - Piso ${floor}`;
    return label;
  }, [unitNumber, tower, floor]);

  return (
    <section className="unit-section">
      <header
        className="unit-section__header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="unit-section__title">
          <span className="unit-section__icon">
            <Icon name="building" size={20} />
          </span>
          <h3>{unitLabel}</h3>
          <span className="unit-section__count">{residents.length} persona{residents.length !== 1 ? 's' : ''}</span>
        </div>
        <span className={`unit-section__chevron ${isExpanded ? 'unit-section__chevron--open' : ''}`}>
          <Icon name="chevronDown" size={14} />
        </span>
      </header>
      {isExpanded && (
        <div className="unit-section__content">
          {residents.map((resident) => (
            <ResidentCard key={resident.id} resident={resident} />
          ))}
        </div>
      )}
    </section>
  );
};

/**
 * Página de administración de residentes
 */
const AdminResidents = () => {
  const { user, buildingVersion } = useAppContext();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnits, setExpandedUnits] = useState(new Set());
  const lastFetchKeyRef = useRef(null);

  const fetchResidents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminUsers.getResidents();
      setResidents(data || []);
    } catch (err) {
      console.error('Error cargando residentes:', err);
      setError(err.message || 'Error al cargar los residentes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `${user.id || user.email || 'anon'}-${buildingVersion ?? '0'}`;
    if (lastFetchKeyRef.current !== key) {
      lastFetchKeyRef.current = key;
      fetchResidents();
    }
  }, [fetchResidents, buildingVersion, user]);

  // Agrupar residentes por unidad
  const groupedResidents = useMemo(() => {
    const groups = {};
    residents.forEach((resident) => {
      const key = `${resident.unitId}-${resident.unitNumber}`;
      if (!groups[key]) {
        groups[key] = {
          unitId: resident.unitId,
          unitNumber: resident.unitNumber,
          tower: resident.tower,
          floor: resident.floor,
          residents: [],
        };
      }
      groups[key].residents.push(resident);
    });
    // Convertir a array y ordenar por piso y número de unidad
    return Object.values(groups).sort((a, b) => {
      const floorA = parseInt(a.floor || '0', 10);
      const floorB = parseInt(b.floor || '0', 10);
      if (floorA !== floorB) return floorA - floorB;
      return (a.unitNumber || '').localeCompare(b.unitNumber || '');
    });
  }, [residents]);

  // Filtrar por búsqueda
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedResidents;
    const term = searchTerm.toLowerCase();
    return groupedResidents
      .map((group) => ({
        ...group,
        residents: group.residents.filter(
          (r) =>
            r.firstName?.toLowerCase().includes(term) ||
            r.lastName?.toLowerCase().includes(term) ||
            r.email?.toLowerCase().includes(term) ||
            r.phone?.includes(term) ||
            group.unitNumber?.toLowerCase().includes(term)
        ),
      }))
      .filter((group) => group.residents.length > 0);
  }, [groupedResidents, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedUnits(new Set(filteredGroups.map((group) => group.unitId)));
      return;
    }
    setExpandedUnits(new Set());
  }, [searchTerm, filteredGroups]);

  // Estadísticas
  const stats = useMemo(() => {
    const unitsWithResidents = groupedResidents.filter((group) => group.unitId !== null && group.unitId !== undefined);
    return {
      totalResidents: residents.length,
      totalUnits: unitsWithResidents.length,
      activeResidents: residents.filter((r) => r.status === 'ACTIVE').length,
    };
  }, [residents, groupedResidents]);

  const handleToggleUnit = (unitId) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedUnits(new Set(filteredGroups.map((group) => group.unitId)));
  };

  const handleCollapseAll = () => {
    setExpandedUnits(new Set());
  };

  return (
    <ProtectedLayout allowedRoles={['admin', 'concierge']}>
      <article className="admin-residents page-shell">
        <header className="admin-residents__header page-header">
          <div className="admin-residents__title-section">
            <p className="admin-residents__eyebrow page-eyebrow">Comunidad</p>
            <h1 className="page-title">Residentes y unidades</h1>
            <p className="admin-residents__subtitle page-subtitle">
              Visualiza residentes activos, agrupa por unidad y gestiona contactos rápido.
            </p>
          </div>
          <div className="admin-residents__actions page-actions">
            <button
              type="button"
              className="admin-residents__refresh"
              onClick={fetchResidents}
              disabled={loading}
              title="Actualizar lista"
            >
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
            <Link to={ROUTES.ADMIN_CREATE_USER} className="btn btn-primary">
              <Icon name="userPlus" size={18} />
              Registrar Residente
            </Link>
          </div>
        </header>

        <section className="admin-residents__stats-grid page-stats" aria-label="Resumen de residentes">
          <div className="admin-residents__stat-card page-stat">
            <span>Total residentes</span>
            <strong>{stats.totalResidents}</strong>
          </div>
          <div className="admin-residents__stat-card page-stat">
            <span>Unidades con residentes</span>
            <strong>{stats.totalUnits}</strong>
          </div>
          <div className="admin-residents__stat-card admin-residents__stat-card--accent page-stat">
            <span>Activos</span>
            <strong>{stats.activeResidents}</strong>
          </div>
        </section>

        <div className="admin-residents__controls page-controls">
          <div className="admin-residents__search">
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono o unidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-residents__search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-residents__search-clear"
                onClick={() => setSearchTerm('')}
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>
          <div className="admin-residents__toggles">
            <button
              type="button"
              className="admin-residents__ghost"
              onClick={handleExpandAll}
              disabled={filteredGroups.length === 0}
            >
              Expandir todo
            </button>
            <button
              type="button"
              className="admin-residents__ghost"
              onClick={handleCollapseAll}
              disabled={filteredGroups.length === 0}
            >
              Contraer todo
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-residents__error">
            <p>{error}</p>
            <button type="button" onClick={fetchResidents}>
              Reintentar
            </button>
          </div>
        )}

        {loading && residents.length === 0 && (
          <div className="admin-residents__skeleton" aria-hidden="true">
            {[0, 1, 2].map((unitIndex) => (
              <div key={unitIndex} className="admin-residents__skeleton-unit">
                <div className="admin-residents__skeleton-header">
                  <span className="admin-residents__skeleton-block admin-residents__skeleton-block--lg" />
                  <span className="admin-residents__skeleton-block admin-residents__skeleton-block--xs" />
                </div>
                <div className="admin-residents__skeleton-cards">
                  {[0, 1].map((cardIndex) => (
                    <div key={cardIndex} className="admin-residents__skeleton-card">
                      <span className="admin-residents__skeleton-avatar" />
                      <div className="admin-residents__skeleton-lines">
                        <span className="admin-residents__skeleton-block admin-residents__skeleton-block--md" />
                        <span className="admin-residents__skeleton-block admin-residents__skeleton-block--sm" />
                      </div>
                      <span className="admin-residents__skeleton-pill" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredGroups.length === 0 && (
          <div className="admin-residents__empty">
            {searchTerm ? (
              <>
                <span className="admin-residents__empty-icon">
                  <Icon name="search" size={40} />
                </span>
                <p>No se encontraron residentes que coincidan con "{searchTerm}"</p>
              </>
            ) : (
              <>
                <span className="admin-residents__empty-icon">
                  <Icon name="home" size={40} />
                </span>
                <p>No hay residentes registrados en este edificio</p>
              </>
            )}
          </div>
        )}

        <div className="admin-residents__list">
          {filteredGroups.map((group) => (
            <UnitSection
              key={group.unitId}
              unitNumber={group.unitNumber}
              tower={group.tower}
              floor={group.floor}
              residents={group.residents}
              isExpanded={expandedUnits.has(group.unitId)}
              onToggle={() => handleToggleUnit(group.unitId)}
            />
          ))}
        </div>
      </article>
    </ProtectedLayout>
  );
};

export default AdminResidents;
