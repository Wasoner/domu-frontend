import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { api } from '../services';
import './AdminIncidentsBoard.css';

const columns = [
  { key: 'reported', title: 'Reportados', status: 'REPORTED' },
  { key: 'inProgress', title: 'En progreso', status: 'IN_PROGRESS' },
  { key: 'closed', title: 'Cerrados', status: 'CLOSED' },
];

const CATEGORY_LABELS = {
  security: 'Seguridad',
  maintenance: 'Mantenimiento',
  noise: 'Ruido',
  cleaning: 'Limpieza',
  access: 'Accesos',
  concierge: 'Conserjería',
  general: 'General',
  other: 'Otros',
};

const AdminIncidentsBoard = () => {
  const { user } = useAppContext();
  const [kanban, setKanban] = useState({ reported: [], inProgress: [], closed: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggingIncident, setDraggingIncident] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const roleLabel = useMemo(() => {
    if (!user) return 'Administrador';
    if (user.userType === 'concierge') return 'Conserje';
    if (user.userType === 'admin') return 'Administrador';
    return user.userType || 'Usuario';
  }, [user]);

  const fetchKanban = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.incidents.listMine();
      setKanban({
        reported: data?.reported || [],
        inProgress: data?.inProgress || [],
        closed: data?.closed || [],
      });
    } catch (error) {
      console.error('No pudimos cargar el tablero de incidentes', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchKanban();
  }, [fetchKanban]);

  const getCategoryLabel = useCallback((category) => {
    const key = (category || 'general').toString().trim().toLowerCase();
    return CATEGORY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }, []);

  const handleDragStart = (incident) => (event) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(incident.id));
    setDraggingIncident(incident);
  };

  const handleDragOver = (status) => (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (status) => (event) => {
    event.preventDefault();
    setDragOverStatus(null);
    if (!draggingIncident) return;
    if (draggingIncident.status === status) return;
    moveIncident(draggingIncident, status);
  };

  const handleDragEnd = () => {
    setDraggingIncident(null);
    setDragOverStatus(null);
  };

  const moveIncident = async (incident, targetStatus) => {
    if (!incident?.id) return;
    const optimistic = { ...kanban };
    const removeFrom = (key) => {
      optimistic[key] = optimistic[key].filter((it) => it.id !== incident.id);
    };
    const addTo = (key) => {
      optimistic[key] = [{ ...incident, status: targetStatus }, ...optimistic[key]];
    };
    removeFrom('reported');
    removeFrom('inProgress');
    removeFrom('closed');
    if (targetStatus === 'REPORTED') addTo('reported');
    if (targetStatus === 'IN_PROGRESS') addTo('inProgress');
    if (targetStatus === 'CLOSED') addTo('closed');
    setKanban(optimistic);
    setSaving(true);
    try {
      await api.incidents.updateStatus(incident.id, targetStatus);
      await fetchKanban();
    } catch (error) {
      console.error('No pudimos actualizar el estado', error);
      fetchKanban();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin', 'concierge']}>
      <article className="incidents-board">
        <header className="incidents-board__header">
          <div>
            <p className="incidents-board__eyebrow">Gestión</p>
            <h1>Tablero de incidentes</h1>
            <p className="incidents-board__subtitle">
              Cambia estados rápidamente. Vista dedicada para {roleLabel}.
            </p>
          </div>
          <div className="incidents-board__actions">
            <button type="button" onClick={fetchKanban} disabled={loading || saving}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </header>

        <section className="kanban kanban--page" aria-label="Tablero de incidentes">
          <div className="kanban__columns">
            {columns.map((column) => (
                <div
                  className={`kanban__column ${dragOverStatus === column.status ? 'kanban__column--drag-over' : ''}`}
                  key={column.key}
                  onDragOver={handleDragOver(column.status)}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop(column.status)}
                >
                <div className="kanban__column-header">
                  <h3>{column.title}</h3>
                  <span className="kanban__badge">{kanban[column.key].length}</span>
                </div>
                <div className="kanban__list" role="list">
                  {kanban[column.key].length === 0 && (
                    <div className="kanban__empty">Sin incidentes en esta columna.</div>
                  )}
                  {kanban[column.key].map((incident) => (
                    <div
                      className={`kanban__card ${draggingIncident?.id === incident.id ? 'kanban__card--dragging' : ''}`}
                      key={incident.id}
                      role="listitem"
                      draggable
                      onDragStart={handleDragStart(incident)}
                      onDragEnd={handleDragEnd}
                    >
                      <p className="kanban__title">{incident.title}</p>
                      <div className="kanban__meta">
                        <span className="kanban__chip">{getCategoryLabel(incident.category)}</span>
                        <span className="kanban__time">
                          {incident.createdAt
                            ? new Date(incident.createdAt).toLocaleString('es-CL', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'Sin fecha'}
                        </span>
                      </div>
                      <div className="kanban__actions">
                        {column.status !== 'REPORTED' && (
                          <button type="button" onClick={() => moveIncident(incident, 'REPORTED')}>
                            En reporte
                          </button>
                        )}
                        {column.status !== 'IN_PROGRESS' && (
                          <button type="button" onClick={() => moveIncident(incident, 'IN_PROGRESS')}>
                            En progreso
                          </button>
                        )}
                        {column.status !== 'CLOSED' && (
                          <button type="button" onClick={() => moveIncident(incident, 'CLOSED')}>
                            Cerrar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </ProtectedLayout>
  );
};

export default AdminIncidentsBoard;
