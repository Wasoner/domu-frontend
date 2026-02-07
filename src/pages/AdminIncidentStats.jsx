import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { Seo, Icon, Skeleton } from '../components';
import { api } from '../services';
import './AdminIncidentStats.scss';

const StatsSkeleton = () => (
  <div className="incident-stats page-shell">
    <header className="page-header">
      <div>
        <Skeleton variant="text" width="80px" height="14px" />
        <Skeleton variant="title" width="260px" />
      </div>
    </header>
    <Skeleton.Stats count={4} />
    <div className="stats-charts" style={{ marginTop: '1.5rem' }}>
      {[1, 2].map(i => (
        <div key={i} className="chart-container card" style={{ padding: '1.25rem' }}>
          <Skeleton variant="title" width="50%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {[1, 2, 3, 4].map(j => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Skeleton variant="text" width="80px" />
                <Skeleton variant="rect" height="16px" />
                <Skeleton variant="text" width="28px" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminIncidentStats = () => {
  const [data, setData] = useState({ reported: [], inProgress: [], closed: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const incidents = await api.incidents.listMine();
      setData(incidents);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const all = [...data.reported, ...data.inProgress, ...data.closed];
    const total = all.length;
    
    // By Category
    const byCategory = all.reduce((acc, curr) => {
      const cat = curr.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // By Status
    const byStatus = {
      REPORTED: data.reported.length,
      IN_PROGRESS: data.inProgress.length,
      CLOSED: data.closed.length
    };

    // By Assignment
    const assigned = all.filter(i => i.assignedToUserId).length;
    const unassigned = total - assigned;

    return { total, byCategory, byStatus, assigned, unassigned };
  }, [data]);

  if (loading) {
    return (
      <ProtectedLayout allowedRoles={['admin']}>
        <StatsSkeleton />
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <Seo title="Estadísticas de Incidentes | Domu" noindex />
      
      <section className="incident-stats page-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow page-eyebrow">Reportes</p>
            <h1 className="page-title">Estadísticas de Incidentes</h1>
            <p className="subtitle page-subtitle">Análisis de resolución y carga de trabajo</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchData}>
            <Icon name="refresh" size={16} />
            Actualizar
          </button>
        </header>

        <div className="stats-grid">
          {/* Tarjetas de Resumen */}
          <div className="stat-card stat-card--total">
            <div className="stat-card__icon"><Icon name="ticket" /></div>
            <div className="stat-card__data">
              <span className="stat-card__value">{stats.total}</span>
              <span className="stat-card__label">Total Incidentes</span>
            </div>
          </div>

          <div className="stat-card stat-card--pending">
            <div className="stat-card__icon"><Icon name="clock" /></div>
            <div className="stat-card__data">
              <span className="stat-card__value">{stats.byStatus.REPORTED}</span>
              <span className="stat-card__label">Nuevos / Pendientes</span>
            </div>
          </div>

          <div className="stat-card stat-card--progress">
            <div className="stat-card__icon"><Icon name="screwdriver" /></div>
            <div className="stat-card__data">
              <span className="stat-card__value">{stats.byStatus.IN_PROGRESS}</span>
              <span className="stat-card__label">En Resolución</span>
            </div>
          </div>

          <div className="stat-card stat-card--resolved">
            <div className="stat-card__icon"><Icon name="check" /></div>
            <div className="stat-card__data">
              <span className="stat-card__value">{stats.byStatus.CLOSED}</span>
              <span className="stat-card__label">Resueltos</span>
            </div>
          </div>
        </div>

        <div className="stats-charts">
          <div className="chart-container card">
            <h3>Distribución por Categoría</h3>
            <div className="category-list">
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <div key={cat} className="category-item">
                  <span className="category-name">{cat}</span>
                  <div className="category-bar-wrapper">
                    <div 
                      className="category-bar" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="category-count">{count}</span>
                </div>
              ))}
              {stats.total === 0 && <p className="empty-msg">No hay datos suficientes</p>}
            </div>
          </div>

          <div className="chart-container card">
            <h3>Asignación de Tareas</h3>
            <div className="assignment-stats">
              <div className="assignment-donut">
                <div className="donut-segment" style={{ '--percent': (stats.assigned / stats.total) * 100 }}></div>
                <div className="donut-center">
                  <span>{Math.round((stats.assigned / (stats.total || 1)) * 100)}%</span>
                  <small>Asignado</small>
                </div>
              </div>
              <div className="assignment-legend">
                <div className="legend-item">
                  <span className="dot dot--assigned"></span>
                  <span>Asignados: <strong>{stats.assigned}</strong></span>
                </div>
                <div className="legend-item">
                  <span className="dot dot--unassigned"></span>
                  <span>Sin asignar: <strong>{stats.unassigned}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ProtectedLayout>
  );
};

export default AdminIncidentStats;
