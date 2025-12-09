import { useState } from 'react';
import { useAppContext } from '../context';
import { AuthLayout } from '../layout';
import './ResidentIncidents.css';

// Datos de ejemplo para incidentes
const mockIncidents = {
  reported: [
    { id: 1, title: 'Fuga en tubería del estacionamiento', date: '2024-12-10', type: 'maintenance' },
    { id: 2, title: 'Luz fundida en pasillo 3er piso', date: '2024-12-09', type: 'maintenance' },
  ],
  inProgress: [
    { id: 3, title: 'Reparación de ascensor A', date: '2024-12-08', type: 'maintenance' },
    { id: 4, title: 'Mantención de jardines', date: '2024-12-07', type: 'maintenance' },
  ],
  closed: [
    { id: 5, title: 'Cambio de cerradura puerta principal', date: '2024-12-05', type: 'security' },
    { id: 6, title: 'Limpieza de ductos de ventilación', date: '2024-12-03', type: 'maintenance' },
  ],
};

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

  const handleReportIncident = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert('Incidente reportado exitosamente. El administrador será notificado.');
      setIncidentForm({ type: '', description: '', location: '' });
      setShowReportModal(false);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <AuthLayout user={user}>
      <article className="resident-incidents">
        <header className="resident-incidents__header">
          <div className="resident-incidents__header-left">
            <h1>Incidentes</h1>
            <p className="resident-incidents__subtitle">
              Seguimiento de los problemas y consultas a tu administración
            </p>
          </div>
          <div className="resident-incidents__header-right">
            <div className="resident-incidents__search">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="m15 15-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="resident-incidents__filter-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="2" rx="1" fill="currentColor"/>
                <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
                <rect x="3" y="14" width="14" height="2" rx="1" fill="currentColor"/>
              </svg>
              Filtrar por fecha
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className="resident-incidents__report-btn"
              onClick={() => setShowReportModal(true)}
            >
              Reportar incidente
            </button>
          </div>
        </header>

        <div className="resident-incidents__panels">
          {/* Panel Reportados */}
          <section className="resident-incidents__panel">
            <div className="resident-incidents__panel-header">
              <h2>Reportados</h2>
            </div>
            <div className="resident-incidents__panel-content">
              <h3>¿Algo no funciona como debe?</h3>
              <p>Aquí verás los incidentes nuevos de tu comunidad</p>
            </div>
            {mockIncidents.reported.length > 0 && (
              <div className="resident-incidents__panel-list">
                {mockIncidents.reported.map((incident) => (
                  <div key={incident.id} className="resident-incidents__incident-item">
                    <span className="resident-incidents__incident-title">{incident.title}</span>
                    <span className="resident-incidents__incident-date">
                      {new Date(incident.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Panel En progreso */}
          <section className="resident-incidents__panel">
            <div className="resident-incidents__panel-header">
              <h2>En progreso</h2>
              <span className="resident-incidents__info-icon">ℹ️</span>
            </div>
            <div className="resident-incidents__panel-content">
              <h3>Trabajos en desarrollo</h3>
              <p>Conoce aquí los incidentes que están en proceso de ser solucionados</p>
            </div>
            {mockIncidents.inProgress.length > 0 && (
              <div className="resident-incidents__panel-list">
                {mockIncidents.inProgress.map((incident) => (
                  <div key={incident.id} className="resident-incidents__incident-item">
                    <span className="resident-incidents__incident-title">{incident.title}</span>
                    <span className="resident-incidents__incident-date">
                      {new Date(incident.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Panel Cerrados */}
          <section className="resident-incidents__panel">
            <div className="resident-incidents__panel-header">
              <h2>Cerrados</h2>
            </div>
            <div className="resident-incidents__panel-content">
              <h3>Trabajos concluidos</h3>
              <p>Los incidentes que tu administración considere listos los visualizarás acá</p>
            </div>
            {mockIncidents.closed.length > 0 && (
              <div className="resident-incidents__panel-list">
                {mockIncidents.closed.map((incident) => (
                  <div key={incident.id} className="resident-incidents__incident-item">
                    <span className="resident-incidents__incident-title">{incident.title}</span>
                    <span className="resident-incidents__incident-date">
                      {new Date(incident.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Modal para reportar incidente */}
        {showReportModal && (
          <div className="resident-incidents__modal-overlay" onClick={() => setShowReportModal(false)}>
            <div className="resident-incidents__modal" onClick={(e) => e.stopPropagation()}>
              <div className="resident-incidents__modal-header">
                <h2>Reportar Incidente</h2>
                <button 
                  className="resident-incidents__modal-close"
                  onClick={() => setShowReportModal(false)}
                >
                  ×
                </button>
              </div>
              <form className="resident-incidents__modal-form" onSubmit={handleReportIncident}>
                <div className="resident-incidents__form-group">
                  <label htmlFor="incident-type">Tipo de incidente</label>
                  <select
                    id="incident-type"
                    value={incidentForm.type}
                    onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="maintenance">Mantención</option>
                    <option value="security">Seguridad</option>
                    <option value="noise">Ruidos molestos</option>
                    <option value="common-area">Área común</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="resident-incidents__form-group">
                  <label htmlFor="incident-location">Ubicación</label>
                  <input
                    id="incident-location"
                    type="text"
                    placeholder="Ej: Estacionamiento nivel -1, Ascensor A"
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                    required
                  />
                </div>
                <div className="resident-incidents__form-group">
                  <label htmlFor="incident-description">Descripción</label>
                  <textarea
                    id="incident-description"
                    rows="4"
                    placeholder="Describe el incidente con el mayor detalle posible..."
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="resident-incidents__modal-actions">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Reportar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </article>
    </AuthLayout>
  );
};

export default ResidentIncidents;

