import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
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

const ProviderServiceOrders = () => {
  const { user } = useAppContext();
  const { id: detailId } = useParams();
  const [orders, setOrders] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const fetchedRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (detailId) {
        const order = await api.provider.getOrder(detailId);
        setDetail(order);
      } else {
        const data = await api.provider.listOrders();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [user, detailId]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchOrders();
    }
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!filterStatus) return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const handleAction = async (orderId, action) => {
    try {
      if (action === 'accept') {
        await api.provider.accept(orderId);
        setSuccess('Orden aceptada');
      } else if (action === 'reject') {
        const notes = window.prompt('Motivo del rechazo:');
        if (notes === null) return;
        await api.provider.reject(orderId, notes);
        setSuccess('Orden rechazada');
      } else if (action === 'complete') {
        const notes = window.prompt('Notas de finalización (opcional):');
        if (notes === null) return;
        await api.provider.complete(orderId, notes);
        setSuccess('Orden completada');
      }
      fetchedRef.current = false;
      fetchOrders();
    } catch (err) {
      setError(err.message || 'Error al actualizar orden');
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  if (detailId && detail) {
    return (
      <ProtectedLayout allowedRoles={['proveedor']}>
        <div className="admin-staff-page">
          <div className="page-header">
            <h1><Icon name="wrench" size={24} /> {detail.title}</h1>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="stats-grid">
            <div className="stat-card"><span className="stat-label">Estado</span><span className="stat-value" style={{ fontSize: '1rem' }}>{STATUS_LABELS[detail.status] || detail.status}</span></div>
            <div className="stat-card"><span className="stat-label">Prioridad</span><span className="stat-value" style={{ fontSize: '1rem' }}>{detail.priority}</span></div>
            <div className="stat-card"><span className="stat-label">Fecha prog.</span><span className="stat-value" style={{ fontSize: '1rem' }}>{detail.scheduledDate || '-'}</span></div>
          </div>
          {detail.description && <p style={{ marginTop: '1rem' }}><strong>Descripción:</strong> {detail.description}</p>}
          {detail.adminNotes && <p><strong>Notas admin:</strong> {detail.adminNotes}</p>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            {detail.status === 'PENDING' && (
              <>
                <button className="btn btn-primary" onClick={() => handleAction(detail.id, 'accept')}>Aceptar</button>
                <button className="btn btn-danger" onClick={() => handleAction(detail.id, 'reject')}>Rechazar</button>
              </>
            )}
            {(detail.status === 'ACCEPTED' || detail.status === 'IN_PROGRESS') && (
              <button className="btn btn-primary" onClick={() => handleAction(detail.id, 'complete')}>Marcar completada</button>
            )}
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={['proveedor']}>
      <div className="admin-staff-page">
        <div className="page-header">
          <h1><Icon name="clipboardCheck" size={24} /> Órdenes asignadas</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="filters-row">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="search-input">
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
          </select>
        </div>

        {loading ? (
          <Skeleton.List count={5} />
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">No hay órdenes asignadas</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha prog.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td><a href={`/proveedor/ordenes/${o.id}`}>{o.title}</a></td>
                    <td><span className={`badge badge-${o.status?.toLowerCase()}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                    <td>{o.priority}</td>
                    <td>{o.scheduledDate || '-'}</td>
                    <td>
                      {o.status === 'PENDING' && (
                        <>
                          <button className="btn btn-sm btn-primary" onClick={() => handleAction(o.id, 'accept')}>Aceptar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleAction(o.id, 'reject')}>Rechazar</button>
                        </>
                      )}
                      {(o.status === 'ACCEPTED' || o.status === 'IN_PROGRESS') && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleAction(o.id, 'complete')}>Completar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default ProviderServiceOrders;
