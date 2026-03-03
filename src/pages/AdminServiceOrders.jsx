import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon, Skeleton } from '../components';
import { api } from '../services';

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const PRIORITY_LABELS = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const AdminServiceOrders = () => {
  const { user, buildingVersion } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    providerId: '',
    title: '',
    description: '',
    scheduledDate: '',
    priority: 'NORMAL',
    adminNotes: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const lastFetchKeyRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [ordersData, providersData] = await Promise.all([
        api.adminServiceOrders.list(),
        api.adminProviders.list(),
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProviders(Array.isArray(providersData) ? providersData : []);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchKey = `${user?.id}-${buildingVersion}`;
    if (fetchKey !== lastFetchKeyRef.current) {
      lastFetchKeyRef.current = fetchKey;
      fetchData();
    }
  }, [fetchData, user, buildingVersion]);

  const filteredOrders = useMemo(() => {
    if (!filterStatus) return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const openCreateModal = () => {
    setEditing(null);
    setFormData({ providerId: '', title: '', description: '', scheduledDate: '', priority: 'NORMAL', adminNotes: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (order) => {
    setEditing(order);
    setFormData({
      providerId: order.providerId || '',
      title: order.title || '',
      description: order.description || '',
      scheduledDate: order.scheduledDate || '',
      priority: order.priority || 'NORMAL',
      adminNotes: order.adminNotes || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.providerId || !formData.title.trim()) {
      setFormError('Proveedor y título son obligatorios');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editing) {
        await api.adminServiceOrders.update(editing.id, formData);
        setSuccess('Orden actualizada correctamente');
      } else {
        await api.adminServiceOrders.create(formData);
        setSuccess('Orden creada correctamente');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Error al guardar orden');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.adminServiceOrders.updateStatus(orderId, newStatus);
      setSuccess('Estado actualizado');
      fetchData();
    } catch (err) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <div className="admin-staff-page">
        <div className="page-header">
          <h1><Icon name="wrench" size={24} /> Órdenes de servicio</h1>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Icon name="plus" size={16} /> Nueva orden
          </button>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="filters-row">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="search-input">
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
          </select>
        </div>

        {loading ? (
          <Skeleton.List count={5} />
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">No se encontraron órdenes de servicio</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Proveedor</th>
                  <th>Fecha prog.</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.title}</td>
                    <td>{o.providerName || '-'}</td>
                    <td>{o.scheduledDate || '-'}</td>
                    <td>{PRIORITY_LABELS[o.priority] || o.priority}</td>
                    <td><span className={`badge badge-${o.status?.toLowerCase()}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => openEditModal(o)}>Editar</button>
                      {o.status === 'PENDING' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(o.id, 'CANCELLED')}>Cancelar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editing ? 'Editar orden' : 'Nueva orden de servicio'}</h2>
              {formError && <div className="alert alert-error">{formError}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Proveedor *</label>
                  <select value={formData.providerId} onChange={(e) => setFormData({ ...formData, providerId: e.target.value })} required>
                    <option value="">Seleccionar proveedor...</option>
                    {providers.filter((p) => p.active).map((p) => (<option key={p.id} value={p.id}>{p.businessName}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Título *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha programada</label>
                    <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Prioridad</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      {Object.entries(PRIORITY_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Notas admin</label>
                  <textarea value={formData.adminNotes} onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })} rows={2} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default AdminServiceOrders;
