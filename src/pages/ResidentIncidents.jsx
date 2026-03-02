import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import { Icon } from '../components';
import './ResidentIncidents.scss';

const PANEL_CONFIG = [
  { key: 'reported', title: 'Reportados', icon: 'clipboard', description: 'Pendientes de revisión', color: '#f59e0b' },
  { key: 'inProgress', title: 'En progreso', icon: 'screwdriver', description: 'Siendo atendidos', color: '#0ea5e9' },
  { key: 'closed', title: 'Cerrados', icon: 'check', description: 'Incidentes resueltos', color: '#22c55e' },
];

/**
 * Configuración de categorías de incidentes
 */
const INCIDENT_CATEGORIES = {
  maintenance: {
    label: 'Mantención',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M9.5 1.5L14.5 6.5L6 15H1V10L9.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 4L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  security: {
    label: 'Seguridad',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L2 4V7.5C2 11.09 4.56 14.42 8 15C11.44 14.42 14 11.09 14 7.5V4L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 5V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  noise: {
    label: 'Ruidos molestos',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 2V14M8 2L4 5H1V11H4L8 14V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 5.5C11.83 6.33 12.33 7.42 12.33 8.5C12.33 9.58 11.83 10.67 11 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13.5 3C15.17 4.67 16 6.83 16 9C16 11.17 15.17 13.33 13.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  'common-area': {
    label: 'Área común',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 6L8 1L14 6V14C14 14.55 13.55 15 13 15H3C2.45 15 2 14.55 2 14V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 15V9H10V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  electrical: {
    label: 'Eléctrico',
    color: '#F97316',
    bgColor: '#FFF7ED',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M9 1L3 9H8L7 15L13 7H8L9 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  plumbing: {
    label: 'Gasfitería',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1V4M8 4C6 4 4 6 4 8C4 10 6 15 8 15C10 15 12 10 12 8C12 6 10 4 8 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  cleaning: {
    label: 'Limpieza',
    color: '#10B981',
    bgColor: '#ECFDF5',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M14 8C14 8 12 6 8 6C4 6 2 8 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 8V14C3 14.55 3.45 15 4 15H12C12.55 15 13 14.55 13 14V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 1V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 3L8 1L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  other: {
    label: 'Otro',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 6C6 5.17 6.67 4 8 4C9.33 4 10 5 10 6C10 7 9 7.5 8 8V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
};

/**
 * Obtiene la configuración de una categoría
 */
const getCategoryConfig = (category) => {
  const key = category?.toLowerCase() || 'other';
  return INCIDENT_CATEGORIES[key] || INCIDENT_CATEGORIES.other;
};

/**
 * Componente para mostrar un item de incidente
 */
const IncidentItem = ({ incident }) => {
  const category = getCategoryConfig(incident.category);
  const title = incident.title?.replace(/^(maintenance|security|noise|common-area|electrical|plumbing|cleaning|other)\s*-\s*/i, '') || 'Sin título';
  
  return (
    <div 
      className="resident-incidents__incident-item"
      style={{ '--category-color': category.color, '--category-bg': category.bgColor }}
    >
      <div className="resident-incidents__incident-category">
        <span className="resident-incidents__category-icon">{category.icon}</span>
        <span className="resident-incidents__category-label">{category.label}</span>
      </div>
      <span className="resident-incidents__incident-title">{title}</span>
      <span className="resident-incidents__incident-date">
        {new Date(incident.createdAt || incident.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  );
};

IncidentItem.propTypes = {
  incident: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    category: PropTypes.string,
    createdAt: PropTypes.string,
    date: PropTypes.string,
  }).isRequired,
};

const ResidentIncidentsSkeleton = () => (
  <div className="resident-incidents__panel-list">
    {[1, 2, 3].map((i) => (
      <div key={i} className="resident-incidents__incident-item resident-incidents__incident-item--skeleton">
        <div className="resident-incidents__incident-category">
          <span className="dashboard__skeleton-block" style={{ width: '80px', height: '20px' }} />
        </div>
        <span className="dashboard__skeleton-block" style={{ width: '60%', height: '16px' }} />
        <span className="dashboard__skeleton-block" style={{ width: '40px', height: '12px' }} />
      </div>
    ))}
  </div>
);

/**
 * Resident Incidents Page Component
 * Page for managing and tracking incidents
 */
const ResidentIncidents = () => {
  const { user } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    type: '',
    description: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidents, setIncidents] = useState({ reported: [], inProgress: [], closed: [] });
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [error, setError] = useState(null);

  const filteredIncidents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filterList = (list) => list.filter((item) => item.title.toLowerCase().includes(query));
    return {
      reported: filterList(incidents.reported),
      inProgress: filterList(incidents.inProgress),
      closed: filterList(incidents.closed),
    };
  }, [incidents, searchQuery]);

  const getDateRange = (filter) => {
    const now = new Date();
    let from;
    switch (filter) {
      case 'week':
        from = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        from = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        from = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        from = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return {};
    }
    return { from: from.toISOString().split('T')[0] };
  };

  const fetchIncidents = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const dateRange = getDateRange(dateFilter);
      const response = await api.incidents.listMine(dateRange);
      setIncidents({
        reported: response?.reported || [],
        inProgress: response?.inProgress || [],
        closed: response?.closed || [],
      });
    } catch (err) {
      setError(err.message || 'No pudimos cargar los incidentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [user, dateFilter]);

  const handleReportIncident = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.incidents.create({
        title: incidentForm.location ? `${incidentForm.type || 'Incidente'} - ${incidentForm.location}` : incidentForm.type || 'Incidente',
        description: incidentForm.description,
        category: incidentForm.type || 'other',
        priority: 'MEDIUM',
      });
      setIncidentForm({ type: '', description: '', location: '' });
      setShowReportModal(false);
      fetchIncidents();
    } catch (err) {
      setError(err.message || 'No pudimos reportar el incidente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateFilterLabels = {
    all: 'Todos',
    week: 'Última semana',
    month: 'Último mes',
    quarter: 'Últimos 3 meses',
    year: 'Último año'
  };

  const panelCounts = {
    reported: filteredIncidents.reported.length,
    inProgress: filteredIncidents.inProgress.length,
    closed: filteredIncidents.closed.length,
  };

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
      <article className="resident-incidents page-shell page-shell--wide">
        <header className="resident-incidents__header">
          <div className="resident-incidents__title-section">
            <p className="resident-incidents__eyebrow">Centro de incidentes</p>
            <h1>Incidentes</h1>
            <p className="resident-incidents__subtitle">
              Seguimiento de los problemas y consultas a tu administración
            </p>
          </div>

          <div className="resident-incidents__toolbar">
            <div className="resident-incidents__filters">
              <div className="resident-incidents__search">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m15 15-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="resident-incidents__date-filter">
                <button
                  type="button"
                  className="resident-incidents__date-filter-btn"
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>Filtrar por fecha</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="resident-incidents__chevron">
                    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showDateDropdown && (
                  <div className="resident-incidents__date-dropdown">
                    {Object.entries(dateFilterLabels).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        className={`resident-incidents__date-option ${dateFilter === key ? 'is-active' : ''}`}
                        onClick={() => {
                          setDateFilter(key);
                          setShowDateDropdown(false);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="resident-incidents__actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowReportModal(true)}
              >
                Reportar incidente
              </button>
            </div>
          </div>
        </header>

        {error && <p className="resident-incidents__error">{error}</p>}

        <div className="resident-incidents__panels">
          {PANEL_CONFIG.map((config) => {
            const incidents = filteredIncidents[config.key];
            const count = panelCounts[config.key];
            const emptyContent = {
              reported: { title: '¿Algo no funciona como debe?', text: 'Aquí verás los incidentes nuevos de tu comunidad' },
              inProgress: { title: 'Trabajos en desarrollo', text: 'Conoce aquí los incidentes que están en proceso de ser solucionados' },
              closed: { title: 'Trabajos concluidos', text: 'Los incidentes que tu administración considere listos los visualizarás acá' },
            };
            const empty = emptyContent[config.key];

            return (
              <section
                key={config.key}
                className={`resident-incidents__panel resident-incidents__panel--${config.key}`}
                style={{ '--panel-color': config.color }}
              >
                <div className="resident-incidents__panel-header">
                  <div className="resident-incidents__panel-title-row">
                    <span className="resident-incidents__panel-icon" aria-hidden="true">
                      <Icon name={config.icon} size={18} />
                    </span>
                    <h2>{config.title}</h2>
                    <span className="resident-incidents__panel-count">{count}</span>
                  </div>
                  <p className="resident-incidents__panel-description">{config.description}</p>
                </div>
                <div className="resident-incidents__panel-body">
                  {loading ? (
                    <ResidentIncidentsSkeleton />
                  ) : incidents.length > 0 ? (
                    <div className="resident-incidents__panel-list">
                      {incidents.map((incident) => (
                        <IncidentItem key={incident.id} incident={incident} />
                      ))}
                    </div>
                  ) : (
                    <div className="resident-incidents__empty-state">
                      <span className="resident-incidents__empty-icon" aria-hidden="true">
                        <Icon name={config.icon} size={28} />
                      </span>
                      <h3>{empty.title}</h3>
                      <p>{empty.text}</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Modal para reportar incidente */}
        {showReportModal && (
          <div className="resident-incidents__modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="resident-incidents__modal resident-incidents__modal--large" onClick={(e) => e.stopPropagation()}>
              <div className="resident-incidents__modal-header">
                <div className="resident-incidents__modal-header-content">
                  <h2>Reportar Incidente</h2>
                  <p className="resident-incidents__modal-subtitle">
                    Selecciona el tipo de problema y proporciona los detalles
                  </p>
                </div>
                <button
                  className="resident-incidents__modal-close"
                  onClick={() => setShowReportModal(false)}
                  aria-label="Cerrar"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form className="resident-incidents__modal-form" onSubmit={handleReportIncident}>
                <div className="resident-incidents__form-section">
                  <label className="resident-incidents__form-label">
                    <span className="resident-incidents__form-label-text">Tipo de incidente</span>
                    <span className="resident-incidents__form-required">*</span>
                  </label>
                  <div className="resident-incidents__category-grid">
                    {Object.entries(INCIDENT_CATEGORIES).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        className={`resident-incidents__category-card ${incidentForm.type === key ? 'is-selected' : ''}`}
                        style={{ '--card-color': config.color, '--card-bg': config.bgColor }}
                        onClick={() => setIncidentForm({ ...incidentForm, type: key })}
                      >
                        <span className="resident-incidents__category-card-icon">
                          {config.icon}
                        </span>
                        <span className="resident-incidents__category-card-label">
                          {config.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="resident-incidents__form-row">
                  <div className="resident-incidents__form-group">
                    <label htmlFor="incident-location" className="resident-incidents__form-label">
                      <span className="resident-incidents__form-label-text">Ubicación</span>
                      <span className="resident-incidents__form-required">*</span>
                    </label>
                    <input
                      id="incident-location"
                      type="text"
                      placeholder="Ej: Estacionamiento nivel -1, Ascensor A"
                      value={incidentForm.location}
                      onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="resident-incidents__form-group">
                  <label htmlFor="incident-description" className="resident-incidents__form-label">
                    <span className="resident-incidents__form-label-text">Descripción del problema</span>
                    <span className="resident-incidents__form-required">*</span>
                  </label>
                  <textarea
                    id="incident-description"
                    rows="5"
                    placeholder="Describe el incidente con el mayor detalle posible: qué ocurrió, cuándo lo notaste, si hay algún riesgo inmediato..."
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    required
                  />
                  <span className="resident-incidents__form-hint">
                    Mientras más detalles proporciones, más rápido podremos atender tu solicitud.
                  </span>
                </div>

                <div className="resident-incidents__modal-footer">
                  <button
                    type="button"
                    className="resident-incidents__cancel-btn"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="resident-incidents__submit-btn"
                    disabled={isSubmitting || !incidentForm.type}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="resident-incidents__spinner" width="16" height="16" viewBox="0 0 16 16">
                          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="28" strokeDashoffset="8" />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M14 2L7 14L5 8L1 6L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Reportar incidente
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentIncidents;
