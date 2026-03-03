import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon, Skeleton } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const ProviderPortal = () => {
  const { user } = useAppContext();
  const [providerInfo, setProviderInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [me, ordersData] = await Promise.all([
        api.provider.getMe(),
        api.provider.listOrders(),
      ]);
      setProviderInfo(me);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err.message || 'Error al cargar datos del proveedor');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const activeCount = orders.filter((o) => o.status === 'ACCEPTED' || o.status === 'IN_PROGRESS').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <ProtectedLayout allowedRoles={['proveedor']}>
      <div className="admin-staff-page">
        <div className="page-header">
          <h1><Icon name="briefcase" size={24} /> Portal del proveedor</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Skeleton.List count={3} />
        ) : (
          <>
            {providerInfo && (
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Empresa</span>
                  <span className="stat-value" style={{ fontSize: '1rem' }}>{providerInfo.businessName}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Categoría</span>
                  <span className="stat-value" style={{ fontSize: '1rem' }}>{providerInfo.serviceCategory}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">RUT</span>
                  <span className="stat-value" style={{ fontSize: '1rem' }}>{providerInfo.rut}</span>
                </div>
              </div>
            )}

            <div className="stats-grid" style={{ marginTop: '1rem' }}>
              <div className="stat-card"><span className="stat-value">{pendingCount}</span><span className="stat-label">Pendientes</span></div>
              <div className="stat-card"><span className="stat-value">{activeCount}</span><span className="stat-label">En curso</span></div>
              <div className="stat-card"><span className="stat-value">{completedCount}</span><span className="stat-label">Completadas</span></div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h2>Órdenes recientes</h2>
              {orders.length === 0 ? (
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
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((o) => (
                        <tr key={o.id}>
                          <td><Link to={`/proveedor/ordenes/${o.id}`}>{o.title}</Link></td>
                          <td><span className={`badge badge-${o.status?.toLowerCase()}`}>{STATUS_LABELS[o.status] || o.status}</span></td>
                          <td>{o.priority}</td>
                          <td>{o.scheduledDate || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {orders.length > 10 && (
                <Link to={ROUTES.PROVIDER_SERVICE_ORDERS} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                  Ver todas las órdenes
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default ProviderPortal;
