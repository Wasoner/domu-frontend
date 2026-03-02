import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon, Skeleton } from '../components';
import { api } from '../services';
import './StaffTasks.scss';

const TASK_STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
};

const TASK_PRIORITY_LABELS = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

const normalizeTaskStatus = (status) => {
  if (!status) return 'PENDING';
  return String(status).toUpperCase();
};

const getNextTaskStatus = (status) => {
  const normalized = normalizeTaskStatus(status);
  if (normalized === 'PENDING') return 'IN_PROGRESS';
  if (normalized === 'IN_PROGRESS') return 'COMPLETED';
  return null;
};

const getTaskActionLabel = (status) => {
  const normalized = normalizeTaskStatus(status);
  if (normalized === 'PENDING') return 'Marcar en progreso';
  if (normalized === 'IN_PROGRESS') return 'Marcar completada';
  return null;
};

const statusWeight = (status) => {
  const normalized = normalizeTaskStatus(status);
  if (normalized === 'PENDING') return 0;
  if (normalized === 'IN_PROGRESS') return 1;
  if (normalized === 'COMPLETED') return 2;
  return 3;
};

const toTimestamp = (value) => {
  const timestamp = new Date(value || '').getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
};

const sortTasks = (list) => {
  return [...list].sort((a, b) => {
    const statusDiff = statusWeight(a.status) - statusWeight(b.status);
    if (statusDiff !== 0) return statusDiff;

    const dueDiff = toTimestamp(a.dueDate || a.deadline) - toTimestamp(b.dueDate || b.deadline);
    if (dueDiff !== 0) return dueDiff;

    return toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
  });
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StaffTasks = () => {
  const { user } = useAppContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staffProfile, setStaffProfile] = useState(null);
  const [staffProfileResolved, setStaffProfileResolved] = useState(false);
  const [error, setError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const staffName = user?.firstName
    ? `${user.firstName} ${user?.lastName || ''}`.trim()
    : user?.email || 'Staff';

  const candidateAssigneeIds = useMemo(() => {
    const currentUserId = Number(user?.id);
    const currentStaffId = Number(staffProfile?.id);
    return [currentStaffId, currentUserId].filter((id) => Number.isFinite(id) && id > 0);
  }, [user?.id, staffProfile?.id]);

  const fetchStaffProfile = useCallback(async () => {
    setStaffProfileResolved(false);
    try {
      const profile = await api.staff.getMine();
      setStaffProfile(profile || null);
    } catch {
      setStaffProfile(null);
    } finally {
      setStaffProfileResolved(true);
    }
  }, []);

  const fetchTasks = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError('');

    try {
      const data = await api.tasks.list();
      const list = Array.isArray(data) ? data : [];

      const mine = list.filter((task) => {
        const assigneeIds = Array.isArray(task.assigneeIds) ? task.assigneeIds.map(Number) : [];
        const assigneeId = Number(task.assigneeId);
        const assignedToUserId = Number(task.assignedToUserId);

        return assigneeIds.some((id) => candidateAssigneeIds.includes(id))
          || candidateAssigneeIds.includes(assigneeId)
          || candidateAssigneeIds.includes(assignedToUserId);
      });

      setTasks(sortTasks(mine));
    } catch (requestError) {
      setTasks([]);
      setError(requestError?.message || 'No se pudieron cargar tus tareas.');
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, [candidateAssigneeIds]);

  useEffect(() => {
    if (!user?.id) return;
    fetchStaffProfile();
  }, [user?.id, fetchStaffProfile]);

  useEffect(() => {
    if (!user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    if (!staffProfileResolved || candidateAssigneeIds.length === 0) return;
    fetchTasks(false);
  }, [user?.id, staffProfileResolved, candidateAssigneeIds, fetchTasks]);

  const handleAdvanceTaskStatus = async (task) => {
    const nextStatus = getNextTaskStatus(task?.status);
    if (!nextStatus || !task?.id) return;

    const selectedBuildingId = Number(localStorage.getItem('selectedBuildingId')) || Number(task.buildingId);
    if (!Number.isFinite(selectedBuildingId) || selectedBuildingId <= 0) {
      setError('No se pudo identificar la comunidad seleccionada.');
      return;
    }

    const assigneeIds = Array.isArray(task.assigneeIds)
      ? task.assigneeIds.map(Number).filter((id) => Number.isFinite(id) && id > 0)
      : [];
    const assigneeId = Number(task.assigneeId);
    if (assigneeIds.length === 0 && Number.isFinite(assigneeId) && assigneeId > 0) {
      assigneeIds.push(assigneeId);
    }

    const payload = {
      communityId: selectedBuildingId,
      title: task.title || 'Tarea',
      description: task.description || '',
      assigneeId: Number.isFinite(assigneeId) && assigneeId > 0 ? assigneeId : null,
      assigneeIds,
      status: nextStatus,
      priority: task.priority || 'MEDIUM',
    };

    if (task.dueDate) {
      payload.dueDate = task.dueDate;
    }
    if (nextStatus === 'COMPLETED') {
      payload.completedAt = new Date().toISOString().slice(0, 19);
    }

    setError('');
    setUpdatingTaskId(task.id);
    try {
      const updatedTask = await api.tasks.update(task.id, payload);
      const updatedStatus = normalizeTaskStatus(updatedTask?.status || nextStatus);
      setTasks((prev) => sortTasks(prev.map((item) => (
        item.id === task.id
          ? {
            ...item,
            ...updatedTask,
            status: updatedStatus,
            completedAt: updatedTask?.completedAt || item.completedAt,
          }
          : item
      ))));
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo actualizar la tarea.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const taskStats = useMemo(() => {
    const pending = tasks.filter((task) => normalizeTaskStatus(task.status) === 'PENDING').length;
    const inProgress = tasks.filter((task) => normalizeTaskStatus(task.status) === 'IN_PROGRESS').length;
    const completed = tasks.filter((task) => normalizeTaskStatus(task.status) === 'COMPLETED').length;
    return { pending, inProgress, completed, total: tasks.length };
  }, [tasks]);

  return (
    <ProtectedLayout allowedRoles={['staff']}>
      <article className="staff-tasks page-shell page-shell--wide">
        <header className="staff-tasks__header page-header">
          <div>
            <p className="staff-tasks__eyebrow">Panel de staff</p>
            <h1>
              <Icon name="clipboardCheck" size={26} />
              Mis tareas
            </h1>
            <p>Gestiona el estado de las tareas que te asigna administracion.</p>
          </div>
          <button
            type="button"
            className="staff-tasks__refresh"
            onClick={() => fetchTasks(true)}
            disabled={loading || refreshing || !staffProfileResolved}
          >
            <Icon name="refresh" size={16} />
            {refreshing ? 'Actualizando...' : `Actualizar (${staffName})`}
          </button>
        </header>

        <section className="staff-tasks__stats">
          <div className="staff-tasks__stat">
            <span>Pendientes</span>
            <strong>{taskStats.pending}</strong>
          </div>
          <div className="staff-tasks__stat">
            <span>En progreso</span>
            <strong>{taskStats.inProgress}</strong>
          </div>
          <div className="staff-tasks__stat">
            <span>Completadas</span>
            <strong>{taskStats.completed}</strong>
          </div>
          <div className="staff-tasks__stat">
            <span>Total</span>
            <strong>{taskStats.total}</strong>
          </div>
        </section>

        {error && <div className="staff-tasks__error">{error}</div>}

        {loading ? (
          <Skeleton.List rows={5} />
        ) : tasks.length === 0 ? (
          <section className="staff-tasks__empty">
            <h2>No tienes tareas asignadas</h2>
            <p>Cuando administracion te asigne nuevas tareas apareceran aqui.</p>
          </section>
        ) : (
          <section className="staff-tasks__list">
            {tasks.map((task) => {
              const status = normalizeTaskStatus(task.status);
              const priority = String(task.priority || 'MEDIUM').toUpperCase();
              const dueDate = task.dueDate || task.deadline;
              const dueLabel = dueDate ? `Vence ${formatDate(dueDate)}` : '';
              const completedLabel = task.completedAt ? `Completada ${formatDate(task.completedAt)}` : '';
              const actionLabel = getTaskActionLabel(status);
              const isUpdating = updatingTaskId === task.id;

              return (
                <div key={task.id} className={`staff-tasks__card staff-tasks__card--${status.toLowerCase()}`}>
                  <div className="staff-tasks__card-main">
                    <h3>{task.title || 'Tarea sin titulo'}</h3>
                    <p>{task.description || 'Sin descripcion.'}</p>
                    <div className="staff-tasks__meta">
                      <span className={`staff-tasks__badge staff-tasks__badge--status-${status.toLowerCase()}`}>
                        {TASK_STATUS_LABELS[status] || status}
                      </span>
                      <span className={`staff-tasks__badge staff-tasks__badge--priority-${priority.toLowerCase()}`}>
                        Prioridad {TASK_PRIORITY_LABELS[priority] || priority}
                      </span>
                      {dueLabel && <span className="staff-tasks__date">{dueLabel}</span>}
                      {completedLabel && <span className="staff-tasks__date">{completedLabel}</span>}
                    </div>
                  </div>

                  {actionLabel && (
                    <button
                      type="button"
                      className="staff-tasks__advance-btn"
                      onClick={() => handleAdvanceTaskStatus(task)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Guardando...' : actionLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default StaffTasks;
