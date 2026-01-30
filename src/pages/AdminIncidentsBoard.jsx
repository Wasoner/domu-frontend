import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { api } from '../services';
import './AdminIncidentsBoard.css';

/**
 * Configuración de columnas del Kanban
 */
const COLUMNS = [
  {
    key: 'reported',
    title: 'Reportados',
    status: 'REPORTED',
    color: '#f59e0b',
    icon: '📋',
    description: 'Nuevos incidentes pendientes de revisión',
  },
  {
    key: 'inProgress',
    title: 'En Progreso',
    status: 'IN_PROGRESS',
    color: '#0ea5e9',
    icon: '🔧',
    description: 'Incidentes siendo atendidos',
  },
  {
    key: 'closed',
    title: 'Cerrados',
    status: 'CLOSED',
    color: '#22c55e',
    icon: '✓',
    description: 'Incidentes resueltos',
  },
];

/**
 * Mapeo de categorías a iconos
 */
const CATEGORY_ICONS = {
  maintenance: '🔧',
  noise: '🔊',
  security: '🔒',
  cleaning: '🧹',
  parking: '🚗',
  elevator: '🛗',
  water: '💧',
  electricity: '⚡',
  general: '📌',
};

/**
 * Componente de tarjeta de incidente draggable
 */
const IncidentCard = ({ incident, onDragStart, onDragEnd, isDragging }) => {
  const categoryIcon = CATEGORY_ICONS[incident.category] || CATEGORY_ICONS.general;

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <article
      className={`kanban-card ${isDragging ? 'kanban-card--dragging' : ''}`}
      draggable="true"
      onDragStart={(e) => onDragStart(e, incident)}
      onDragEnd={onDragEnd}
      role="listitem"
      aria-grabbed={isDragging}
    >
      <div className="kanban-card__header">
        <span className="kanban-card__category">
          <span aria-hidden="true">{categoryIcon}</span>
          {incident.category || 'general'}
        </span>
        <span className="kanban-card__id">#{incident.id}</span>
      </div>

      <h4 className="kanban-card__title">{incident.title}</h4>

      {incident.description && (
        <p className="kanban-card__description">
          {incident.description.length > 80
            ? `${incident.description.substring(0, 80)}...`
            : incident.description}
        </p>
      )}

      <div className="kanban-card__footer">
        <span className="kanban-card__time">
          {formatDate(incident.createdAt)}
        </span>
        {incident.unit && (
          <span className="kanban-card__unit">
            Unidad {incident.unit}
          </span>
        )}
      </div>

      <div className="kanban-card__drag-hint" aria-hidden="true">
        <span>⋮⋮</span>
      </div>
    </article>
  );
};

/**
 * Componente de columna del Kanban
 */
const KanbanColumn = ({
  column,
  incidents,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
  draggingIncident,
}) => {
  const isEmpty = incidents.length === 0;
  const canDrop = draggingIncident && draggingIncident.status !== column.status;

  return (
    <div
      className={`kanban-column ${isDragOver ? 'kanban-column--drag-over' : ''} ${canDrop ? 'kanban-column--can-drop' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, column.status)}
      style={{ '--column-color': column.color }}
    >
      <div className="kanban-column__header">
        <div className="kanban-column__title-row">
          <span className="kanban-column__icon" aria-hidden="true">
            {column.icon}
          </span>
          <h3>{column.title}</h3>
          <span className="kanban-column__count">{incidents.length}</span>
        </div>
        <p className="kanban-column__description">{column.description}</p>
      </div>

      <div
        className={`kanban-column__list ${isEmpty ? 'kanban-column__list--empty' : ''}`}
        role="list"
        aria-label={`Lista de incidentes ${column.title}`}
      >
        {isEmpty && !isDragOver && (
          <div className="kanban-column__empty">
            <span className="kanban-column__empty-icon" aria-hidden="true">
              {column.icon}
            </span>
            <p>Sin incidentes</p>
          </div>
        )}

        {isDragOver && canDrop && (
          <div className="kanban-column__drop-indicator">
            <span>Soltar aquí para mover a "{column.title}"</span>
          </div>
        )}

        {incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggingIncident?.id === incident.id}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Tablero Kanban de Incidentes
 * Panel estilo Trello con drag and drop para gestión de estados
 */
const AdminIncidentsBoard = () => {
  const { user, buildingVersion } = useAppContext();
  const [kanban, setKanban] = useState({ reported: [], inProgress: [], closed: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggingIncident, setDraggingIncident] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const dragCounterRef = useRef({});

  const totalIncidents = useMemo(() => {
    return kanban.reported.length + kanban.inProgress.length + kanban.closed.length;
  }, [kanban]);

  const fetchKanban = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const selectedBuildingId = localStorage.getItem('selectedBuildingId');
      console.log('[AdminIncidentsBoard] Cargando incidentes. User:', user.id, 'BuildingId:', selectedBuildingId);

      const data = await api.incidents.listMine();

      console.log('[AdminIncidentsBoard] Incidentes recibidos:', {
        reported: data?.reported?.length || 0,
        inProgress: data?.inProgress?.length || 0,
        closed: data?.closed?.length || 0,
      });

      setKanban({
        reported: data?.reported || [],
        inProgress: data?.inProgress || [],
        closed: data?.closed || [],
      });
    } catch (error) {
      console.error('Error cargando incidentes:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchKanban();
  }, [fetchKanban, buildingVersion]); // Recargar cuando cambia el edificio

  // Auto-ocultar mensaje de acción después de 3 segundos
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  const handleDragStart = (e, incident) => {
    setDraggingIncident(incident);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', incident.id);

    // Añadir clase al body para estilos globales durante drag
    document.body.classList.add('is-dragging');
  };

  const handleDragEnd = () => {
    setDraggingIncident(null);
    setDragOverColumn(null);
    dragCounterRef.current = {};
    document.body.classList.remove('is-dragging');
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Usar contador para manejar elementos anidados
    if (!dragCounterRef.current[columnKey]) {
      dragCounterRef.current[columnKey] = 0;
    }
    dragCounterRef.current[columnKey]++;
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = (e, columnKey) => {
    dragCounterRef.current[columnKey]--;
    if (dragCounterRef.current[columnKey] === 0) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    dragCounterRef.current = {};

    if (!draggingIncident || draggingIncident.status === targetStatus) {
      return;
    }

    const incident = draggingIncident;
    const fromStatus = incident.status;
    const toColumn = COLUMNS.find((c) => c.status === targetStatus);

    // Actualización optimista
    const optimisticKanban = { ...kanban };
    const getKeyFromStatus = (status) => {
      if (status === 'REPORTED') return 'reported';
      if (status === 'IN_PROGRESS') return 'inProgress';
      return 'closed';
    };

    const fromKey = getKeyFromStatus(fromStatus);
    const toKey = getKeyFromStatus(targetStatus);

    optimisticKanban[fromKey] = optimisticKanban[fromKey].filter((i) => i.id !== incident.id);
    optimisticKanban[toKey] = [{ ...incident, status: targetStatus }, ...optimisticKanban[toKey]];

    setKanban(optimisticKanban);
    setDraggingIncident(null);
    setSaving(true);

    try {
      await api.incidents.updateStatus(incident.id, targetStatus);
      setLastAction({
        type: 'success',
        message: `"${incident.title}" movido a ${toColumn.title}`,
      });
      await fetchKanban();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      setLastAction({
        type: 'error',
        message: 'Error al mover el incidente. Intenta de nuevo.',
      });
      fetchKanban(); // Revertir en caso de error
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin', 'concierge']}>
      <article className="incidents-board">
        {/* Header */}
        <header className="incidents-board__header">
          <div className="incidents-board__title-section">
            <h1>Gestión de Incidentes</h1>
            <p className="incidents-board__subtitle">
              Arrastra las tarjetas entre columnas para cambiar su estado
            </p>
          </div>

          <div className="incidents-board__toolbar">
            <div className="incidents-board__stats">
              <span className="incidents-board__stat">
                <strong>{totalIncidents}</strong> total
              </span>
              <span className="incidents-board__stat incidents-board__stat--warning">
                <strong>{kanban.reported.length}</strong> pendientes
              </span>
            </div>

            <button
              type="button"
              className="incidents-board__refresh"
              onClick={fetchKanban}
              disabled={loading || saving}
              aria-label="Actualizar tablero"
            >
              <span className={loading ? 'is-spinning' : ''}>↻</span>
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </header>

        {/* Notificación de acción */}
        {lastAction && (
          <div
            className={`incidents-board__toast incidents-board__toast--${lastAction.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="incidents-board__toast-icon">
              {lastAction.type === 'success' ? '✓' : '!'}
            </span>
            {lastAction.message}
          </div>
        )}

        {/* Indicador de guardado */}
        {saving && (
          <div className="incidents-board__saving" aria-live="polite">
            Guardando cambios...
          </div>
        )}

        {/* Tablero Kanban */}
        <section className="kanban-board" aria-label="Tablero de incidentes">
          <div className="kanban-board__columns">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.key}
                column={column}
                incidents={kanban[column.key]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={(e) => handleDragLeave(e, column.key)}
                onDrop={handleDrop}
                isDragOver={dragOverColumn === column.key}
                draggingIncident={draggingIncident}
              />
            ))}
          </div>
        </section>

        {/* Instrucciones */}
        <footer className="incidents-board__help">
          <p>
            <strong>Tip:</strong> Arrastra y suelta las tarjetas para actualizar el estado de los incidentes.
            Los cambios se guardan automáticamente.
          </p>
        </footer>
      </article>
    </ProtectedLayout>
  );
};

export default AdminIncidentsBoard;
