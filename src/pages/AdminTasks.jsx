import { useEffect, useState, useCallback } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon } from '../components';
import { api } from '../services';
import './AdminHousingUnits.scss'; // Reusando estilos de tablas similares

const AdminTasks = () => {
  const { user, buildingVersion } = useAppContext();
  const [tasks, setTasks] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    assigneeIds: []
  });

  const fetchStaff = useCallback(async () => {
    try {
      // Intentar primero con listActive, si falla usar list y filtrar
      let data;
      try {
        data = await api.adminStaff.listActive();
      } catch (err) {
        // Si listActive no existe, usar list y filtrar en el frontend
        console.warn('Endpoint listActive no disponible, usando list:', err.message);
        const allStaff = await api.adminStaff.list();
        data = (allStaff || []).filter(s => s.active === true);
      }
      setStaffMembers(data || []);
    } catch (err) {
      console.error('Error cargando personal:', err);
      setStaffMembers([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.tasks.list();
      setTasks(data || []);
    } catch (err) {
      // Solo mostrar error si no es un error de conexión
      if (err.message && !err.message.includes('ECONNREFUSED') && !err.message.includes('Failed to fetch')) {
        setError(err.message || 'Error al cargar tareas.');
      } else {
        // Error de conexión: solo loguear, no mostrar al usuario
        console.warn('Backend no disponible:', err.message);
        setError(null);
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, [fetchTasks, fetchStaff]);

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

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="admin-housing-units">
        <header className="admin-housing-units__header">
          <h1>Tareas del Staff (RF_05)</h1>
          <button className="admin-housing-units__add" onClick={() => setShowModal(true)}>
            Nueva Tarea
          </button>
        </header>

        {loading ? (
          <p>Cargando...</p>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No hay tareas registradas</p>
          </div>
        ) : (
          <table className="admin-housing-units__table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Título</th>
                <th style={{ padding: '10px' }}>Asignado a</th>
                <th style={{ padding: '10px' }}>Prioridad</th>
                <th style={{ padding: '10px' }}>Estado</th>
                <th style={{ padding: '10px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>
                    <strong>{task.title}</strong>
                    {task.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{task.description}</p>
                    )}
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.875rem', color: '#666' }}>
                    {getAssignedStaffNames(task)}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: task.priority === 'HIGH' ? '#fee2e2' : task.priority === 'MEDIUM' ? '#fef3c7' : '#e0f2fe',
                      color: task.priority === 'HIGH' ? '#991b1b' : task.priority === 'MEDIUM' ? '#92400e' : '#1e40af'
                    }}>
                      {task.priority === 'HIGH' ? 'Alta' : task.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: task.status === 'COMPLETED' ? '#e6fffa' : task.status === 'IN_PROGRESS' ? '#dbeafe' : '#fffaf0',
                      color: task.status === 'COMPLETED' ? '#2c7a7b' : task.status === 'IN_PROGRESS' ? '#1e40af' : '#b7791f'
                    }}>
                      {task.status === 'COMPLETED' ? 'Completada' : task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {task.status !== 'COMPLETED' && (
                      <button onClick={() => handleComplete(task)} style={{ marginRight: '10px', padding: '4px 8px', fontSize: '0.875rem' }}>Completar</button>
                    )}
                    <button onClick={() => handleDelete(task.id)} style={{ color: 'red', padding: '4px 8px', fontSize: '0.875rem' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Nueva Tarea</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Título <span style={{ color: 'red' }}>*</span></label>
                  <input 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9375rem' }}
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    placeholder="Ej. Limpieza de áreas comunes"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Descripción</label>
                  <textarea 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9375rem', minHeight: '80px', resize: 'vertical' }}
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Descripción detallada de la tarea..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Asignar a</label>
                  {loadingStaff ? (
                    <p style={{ fontSize: '0.875rem', color: '#666' }}>Cargando personal...</p>
                  ) : staffMembers.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#666', fontStyle: 'italic' }}>No hay personal activo disponible</p>
                  ) : (
                    <select 
                      multiple
                      size={Math.min(staffMembers.length, 5)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9375rem' }}
                      value={formData.assigneeIds.map(id => String(id))}
                      onChange={handleAssigneeChange}
                    >
                      {staffMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName} - {member.position}
                        </option>
                      ))}
                    </select>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', marginBottom: 0 }}>
                    Mantén presionada la tecla Ctrl (Cmd en Mac) para seleccionar múltiples personas
                  </p>
                  {formData.assigneeIds.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {formData.assigneeIds.map(id => {
                        const member = staffMembers.find(s => s.id === id);
                        return member ? (
                          <span key={id} style={{ 
                            display: 'inline-block', 
                            padding: '4px 8px', 
                            background: '#e0f2fe', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            color: '#1e40af'
                          }}>
                            {member.firstName} {member.lastName}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Prioridad</label>
                  <select 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9375rem' }}
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ title: '', description: '', priority: 'MEDIUM', status: 'PENDING', assigneeIds: [] });
                    }}
                    style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    style={{ background: '#0070f3', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
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
