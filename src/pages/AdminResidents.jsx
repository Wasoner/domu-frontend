import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { api } from '../services';
import './AdminResidents.scss';

/**
 * Iconos de roles
 */
const ROLE_ICONS = {
  Administrador: '👑',
  Residente: '🏠',
  Conserje: '🔑',
  Personal: '🔧',
  Usuario: '👤',
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
            {roleIcon} {resident.roleName}
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
const UnitSection = ({ unitNumber, tower, floor, residents }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const unitLabel = useMemo(() => {
    let label = `Unidad ${unitNumber}`;
    if (tower) label += ` - Torre ${tower}`;
    if (floor) label += ` - Piso ${floor}`;
    return label;
  }, [unitNumber, tower, floor]);

  return (
    <section className="unit-section">
      <header
        className="unit-section__header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="unit-section__title">
          <span className="unit-section__icon">🏢</span>
          <h3>{unitLabel}</h3>
          <span className="unit-section__count">{residents.length} persona{residents.length !== 1 ? 's' : ''}</span>
        </div>
        <span className={`unit-section__chevron ${isExpanded ? 'unit-section__chevron--open' : ''}`}>
          ▼
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
    fetchResidents();
  }, [fetchResidents, buildingVersion]);

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

  // Estadísticas
  const stats = useMemo(() => ({
    totalResidents: residents.length,
    totalUnits: groupedResidents.length,
    activeResidents: residents.filter((r) => r.status === 'ACTIVE').length,
  }), [residents, groupedResidents]);

  return (
    <ProtectedLayout allowedRoles={['admin', 'concierge']}>
      <article className="admin-residents">
        <header className="admin-residents__header">
          <div className="admin-residents__title-section">
            <h1>👥 Residentes</h1>
            <p className="admin-residents__subtitle">
              Lista de residentes del edificio, agrupados por unidad
            </p>
          </div>
          <div className="admin-residents__toolbar">
            <div className="admin-residents__stats">
              <span className="admin-residents__stat">
                <strong>{stats.totalResidents}</strong> personas
              </span>
              <span className="admin-residents__stat">
                <strong>{stats.totalUnits}</strong> unidades
              </span>
            </div>
            <button
              type="button"
              className="admin-residents__refresh"
              onClick={fetchResidents}
              disabled={loading}
              title="Actualizar lista"
            >
              {loading ? '...' : '↻'}
            </button>
          </div>
        </header>

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
              ✕
            </button>
          )}
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
          <div className="admin-residents__loading">
            <p>Cargando residentes...</p>
          </div>
        )}

        {!loading && !error && filteredGroups.length === 0 && (
          <div className="admin-residents__empty">
            {searchTerm ? (
              <>
                <span className="admin-residents__empty-icon">🔍</span>
                <p>No se encontraron residentes que coincidan con "{searchTerm}"</p>
              </>
            ) : (
              <>
                <span className="admin-residents__empty-icon">🏠</span>
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
            />
          ))}
        </div>
      </article>
    </ProtectedLayout>
  );
};

export default AdminResidents;
