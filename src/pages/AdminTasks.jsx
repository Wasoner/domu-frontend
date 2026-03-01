import { useEffect, useState, useCallback, useRef } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon, Skeleton } from '../components';
import { api } from '../services';
import './AdminTasks.scss';

const AdminTasks = () => {
  const { user } = useAppContext();
  const [tasks, setTasks] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    assigneeIds: []
  });
  const hasFetchedRef = useRef(false);

  const fetchStaff = useCallback(async () => {
    try {
      let data;
      try {
        data = await api.adminStaff.listActive();
      } catch (err) {
        console.warn('Endpoint listActive no disponible, usando list:', err.message);
        const allStaff = await api.adminStaff.list();
        data = (allStaff || []).filter(s => s.active === true);
      }
      setStaffMembers(data || []);
    } catch (err) {
      console.error('Error cargando personal:', err);
      setStaffMembers([]);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.tasks.list();
      setTasks(data || []);
    } catch (err) {
      if (err.message && !err.message.includes('ECONNREFUSED') && !err.message.includes('Failed to fetch')) {
        console.error('Error al cargar tareas:', err.message);
      } else {
        console.warn('Backend no disponible:', err.message);
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchTasks();
    fetchStaff();
  }, [user, fetchTasks, fetchStaff]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const selectedBuildingId = localStorage.getItem('selectedBuildingId');
      await api.tasks.create({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assigneeIds: formData.assigneeIds || [],
        communityId: Number(selectedBuildingId)
      });
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING', assigneeIds: [] });
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Error al crear tarea');
    }
  };

  const handleComplete = async (task) => {
    try {
      const selectedBuildingId = localStorage.getItem('selectedBuildingId');
      await api.tasks.update(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: 'COMPLETED',
        assigneeIds: task.assigneeIds || [],
        communityId: task.buildingId || Number(selectedBuildingId)
      });
      fetchTasks();
    } catch (err) {
      alert(err.message || 'Error al actualizar tarea');
    }
  };

  const getAssignedStaffNames = (task) => {
    if (!task.assigneeIds || task.assigneeIds.length === 0) {
      return 'Sin asignar';
    }
    const assigned = staffMembers.filter(s => task.assigneeIds.includes(s.id));
    if (assigned.length === 0) return 'Sin asignar';
    return assigned.map(s => `${s.firstName} ${s.lastName}`).join(', ');
  };

  const handleAssigneeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
    setFormData({ ...formData, assigneeIds: selectedOptions });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await api.tasks.delete(id);
      fetchTasks();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };
    return labels[priority] || priority;
  };

  const getStatusLabel = (status) => {
    const labels = { COMPLETED: 'Completada', IN_PROGRESS: 'En Progreso', PENDING: 'Pendiente' };
    return labels[status] || status;
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING', assigneeIds: [] });
  };

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="admin-tasks page-shell">
        <header className="admin-tasks__header page-header">
          <div className="admin-tasks__title-section">
            <h1>
              <Icon name="listBullet" size={28} className="admin-tasks__title-icon" />
              Tareas del Staff
            </h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Icon name="plus" size={18} />
            Nueva Tarea
          </button>
        </header>

        {loading ? (
          <Skeleton.List rows={4} />
        ) : tasks.length === 0 ? (
          <div className="admin-tasks__empty">
            <p>No hay tareas registradas</p>
          </div>
        ) : (
          <div className="admin-tasks__table-container">
            <table className="admin-tasks__table">
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Asignado a</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <span className="admin-tasks__task-title">{task.title}</span>
                      {task.description && (
                        <p className="admin-tasks__task-description">{task.description}</p>
                      )}
                    </td>
                    <td className="admin-tasks__assignee">
                      {getAssignedStaffNames(task)}
                    </td>
                    <td>
                      <span className={`admin-tasks__priority-badge admin-tasks__priority-badge--${task.priority.toLowerCase()}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-tasks__status-badge admin-tasks__status-badge--${task.status.toLowerCase()}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-tasks__actions-cell">
                        {task.status !== 'COMPLETED' && (
                          <button
                            className="admin-tasks__action-btn admin-tasks__action-btn--complete"
                            onClick={() => handleComplete(task)}
                          >
                            Completar
                          </button>
                        )}
                        <button
                          className="admin-tasks__action-btn admin-tasks__action-btn--delete"
                          onClick={() => handleDelete(task.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="admin-tasks__modal-overlay" onClick={handleCloseModal}>
            <div className="admin-tasks__modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-tasks__modal-header">
                <h2>Nueva Tarea</h2>
                <button
                  type="button"
                  className="admin-tasks__modal-close"
                  onClick={handleCloseModal}
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="admin-tasks__form">
                <div className="admin-tasks__form-group">
                  <label>Titulo <span className="required">*</span></label>
                  <input
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Ej. Limpieza de areas comunes"
                  />
                </div>

                <div className="admin-tasks__form-group">
                  <label>Descripcion</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripcion detallada de la tarea..."
                  />
                </div>

                <div className="admin-tasks__form-group">
                  <label>Asignar a</label>
                  {loadingStaff ? (
                    <Skeleton variant="rect" height="38px" borderRadius="4px" />
                  ) : staffMembers.length === 0 ? (
                    <p className="admin-tasks__form-empty">No hay personal activo disponible</p>
                  ) : (
                    <>
                      <select
                        multiple
                        size={Math.min(staffMembers.length, 5)}
                        value={formData.assigneeIds.map(id => String(id))}
                        onChange={handleAssigneeChange}
                      >
                        {staffMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} - {member.position}
                          </option>
                        ))}
                      </select>
                      <p className="admin-tasks__form-help">
                        Manten presionada la tecla Ctrl (Cmd en Mac) para seleccionar multiples personas
                      </p>
                      {formData.assigneeIds.length > 0 && (
                        <div className="admin-tasks__selected-assignees">
                          {formData.assigneeIds.map(id => {
                            const member = staffMembers.find(s => s.id === id);
                            return member ? (
                              <span key={id} className="admin-tasks__assignee-tag">
                                {member.firstName} {member.lastName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="admin-tasks__form-group">
                  <label>Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>

                <div className="admin-tasks__form-footer">
                  <button
                    type="button"
                    className="admin-tasks__btn-cancel"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="admin-tasks__btn-submit">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default AdminTasks;
