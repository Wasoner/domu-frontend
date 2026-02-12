import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { Seo, Icon, Skeleton } from '../components';
import { api } from '../services';
import './AdminIncidentStats.scss';

const STATUS_CONFIG = {
  REPORTED: {
    label: 'Nuevos / Pendientes',
    color: '#f59e0b',
    icon: 'clock',
  },
  IN_PROGRESS: {
    label: 'En Resolución',
    color: '#0ea5e9',
    icon: 'screwdriver',
  },
  CLOSED: {
    label: 'Resueltos',
    color: '#22c55e',
    icon: 'check',
  },
};

const CATEGORY_CONFIG = {
  maintenance: { label: 'Mantención', color: '#3b82f6' },
  security: { label: 'Seguridad', color: '#ef4444' },
  noise: { label: 'Ruidos', color: '#f59e0b' },
  cleaning: { label: 'Limpieza', color: '#10b981' },
  parking: { label: 'Estacionamiento', color: '#06b6d4' },
  elevator: { label: 'Ascensor', color: '#8b5cf6' },
  water: { label: 'Agua', color: '#0ea5e9' },
  electricity: { label: 'Electricidad', color: '#f97316' },
  electrical: { label: 'Eléctrico', color: '#f97316' },
  plumbing: { label: 'Gasfitería', color: '#14b8a6' },
  'common-area': { label: 'Área Común', color: '#7c3aed' },
  general: { label: 'General', color: '#6b7280' },
  other: { label: 'Otros', color: '#6b7280' },
};

const AGE_BUCKETS = [
  { key: 'fresh', label: '0 a 24 h', minHours: 0, maxHours: 24, tone: 'success' },
  { key: 'watch', label: '24 a 72 h', minHours: 24, maxHours: 72, tone: 'warning' },
  { key: 'critical', label: 'Más de 72 h', minHours: 72, maxHours: Number.POSITIVE_INFINITY, tone: 'critical' },
];

const WEEKS_TO_SHOW = 6;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_WEEK = MS_PER_HOUR * 24 * 7;

const normalizeCategory = (category) => String(category || 'other').trim().toLowerCase();

const parseIncidentDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfWeek = (value) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const humanizeCategory = (value) => {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDuration = (hours) => {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return 'N/D';
  if (hours < 1) return '< 1 h';
  if (hours < 24) return `${Math.round(hours)} h`;

  const days = hours / 24;
  if (days < 10) return `${days.toFixed(1).replace('.', ',')} días`;
  return `${Math.round(days)} días`;
};

const formatDateTime = (date) => {
  if (!date) return 'Sin actualización';
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const StatsSkeleton = () => (
  <div className="incident-stats page-shell page-shell--wide">
    <header className="incident-stats__header page-header">
      <div>
        <Skeleton variant="text" width="90px" height="14px" />
        <Skeleton variant="title" width="min(360px, 100%)" />
        <Skeleton variant="text" width="min(340px, 100%)" />
      </div>
      <Skeleton variant="rect" width="132px" height="44px" />
    </header>

    <section className="incident-stats__kpis" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <article key={index} className="incident-kpi incident-kpi--skeleton">
          <Skeleton variant="rect" width="38px" height="38px" />
          <div className="incident-kpi__content">
            <Skeleton variant="title" width="46%" />
            <Skeleton variant="text" width="72%" />
            <Skeleton variant="text" width="88%" />
          </div>
        </article>
      ))}
    </section>

    <section className="incident-stats__grid" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <article key={index} className="incident-panel incident-panel--skeleton">
          <Skeleton variant="title" width="58%" />
          <div className="incident-panel__skeleton-lines">
            <Skeleton variant="rect" height="16px" />
            <Skeleton variant="rect" height="16px" />
            <Skeleton variant="rect" height="16px" />
          </div>
        </article>
      ))}
    </section>
  </div>
);

const AdminIncidentStats = () => {
  const [data, setData] = useState({ reported: [], inProgress: [], closed: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async ({ background = false } = {}) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const incidents = await api.incidents.listMine();
      setData({
        reported: incidents?.reported || [],
        inProgress: incidents?.inProgress || [],
        closed: incidents?.closed || [],
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching incident stats:', error);
    } finally {
      if (background) {
        setRefreshing(false);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const reported = data.reported || [];
    const inProgress = data.inProgress || [];
    const closed = data.closed || [];

    const byStatus = {
      REPORTED: reported.length,
      IN_PROGRESS: inProgress.length,
      CLOSED: closed.length,
    };

    const all = [...reported, ...inProgress, ...closed];
    const openIncidents = [...reported, ...inProgress];
    const total = all.length;
    const openTotal = openIncidents.length;

    const statusSegments = Object.entries(STATUS_CONFIG).map(([key, config]) => {
      const count = byStatus[key] || 0;
      return {
        key,
        ...config,
        count,
        percent: total ? (count / total) * 100 : 0,
      };
    });

    const byCategory = all.reduce((acc, incident) => {
      const key = normalizeCategory(incident.category);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.entries(byCategory)
      .map(([key, count]) => {
        const config = CATEGORY_CONFIG[key] || CATEGORY_CONFIG.other;
        return {
          key,
          count,
          label: config?.label || humanizeCategory(key),
          color: config?.color || CATEGORY_CONFIG.other.color,
          percent: total ? (count / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    const maxCategoryCount = Math.max(...categories.map((entry) => entry.count), 1);

    const resolutionDurations = closed.reduce((acc, incident) => {
      const start = parseIncidentDate(incident.createdAt || incident.date);
      const end = parseIncidentDate(incident.closedAt || incident.resolvedAt || incident.updatedAt);

      if (!start || !end) return acc;

      const diffHours = (end.getTime() - start.getTime()) / MS_PER_HOUR;
      if (diffHours >= 0) {
        acc.push(diffHours);
      }
      return acc;
    }, []);

    const averageResolutionHours = resolutionDurations.length
      ? resolutionDurations.reduce((sum, value) => sum + value, 0) / resolutionDurations.length
      : null;

    const ageBuckets = AGE_BUCKETS.map((bucket) => ({ ...bucket, count: 0, percent: 0 }));
    let totalOpenAgeHours = 0;

    openIncidents.forEach((incident) => {
      const createdAt = parseIncidentDate(incident.createdAt || incident.date);
      if (!createdAt) return;

      const ageHours = Math.max((Date.now() - createdAt.getTime()) / MS_PER_HOUR, 0);
      totalOpenAgeHours += ageHours;

      const matchedBucket = ageBuckets.find(
        (bucket) => ageHours >= bucket.minHours && ageHours < bucket.maxHours
      );

      if (matchedBucket) {
        matchedBucket.count += 1;
      }
    });

    ageBuckets.forEach((bucket) => {
      bucket.percent = openTotal ? (bucket.count / openTotal) * 100 : 0;
    });

    const maxAgeBucketCount = Math.max(...ageBuckets.map((bucket) => bucket.count), 1);
    const criticalBacklog = ageBuckets.find((bucket) => bucket.key === 'critical')?.count || 0;
    const averageOpenAgeHours = openTotal ? totalOpenAgeHours / openTotal : null;

    const assignedOpen = openIncidents.filter((incident) => Boolean(incident.assignedToUserId)).length;
    const unassignedOpen = openTotal - assignedOpen;

    const completionRate = total ? (closed.length / total) * 100 : 0;
    const assignmentRate = openTotal ? (assignedOpen / openTotal) * 100 : 0;

    const now = new Date();
    const currentWeekStart = startOfWeek(now);
    const weekStarts = Array.from({ length: WEEKS_TO_SHOW }, (_, index) => {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - ((WEEKS_TO_SHOW - 1 - index) * 7));
      return weekStart;
    });

    const firstWeekMs = weekStarts[0].getTime();
    const trend = weekStarts.map((weekStart) => ({
      label: weekStart.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
      count: 0,
    }));

    all.forEach((incident) => {
      const createdAt = parseIncidentDate(incident.createdAt || incident.date);
      if (!createdAt) return;

      const diffFromStart = createdAt.getTime() - firstWeekMs;
      const index = Math.floor(diffFromStart / MS_PER_WEEK);

      if (index >= 0 && index < trend.length) {
        trend[index].count += 1;
      }
    });

    const maxTrendCount = Math.max(...trend.map((entry) => entry.count), 1);

    const alerts = [];

    if (total === 0) {
      alerts.push({
        tone: 'neutral',
        title: 'Sin historial suficiente',
        detail: 'No hay incidentes registrados para construir indicadores de gestión.',
      });
    } else {
      if (criticalBacklog > 0) {
        alerts.push({
          tone: 'critical',
          title: `${criticalBacklog} incidentes superan 72 horas`,
          detail: 'Prioriza escalamiento para evitar incumplimientos de servicio.',
        });
      }

      if (unassignedOpen > 0) {
        alerts.push({
          tone: 'warning',
          title: `${unassignedOpen} incidentes abiertos sin responsable`,
          detail: 'Asigna equipo para reducir tiempos de espera y reclamos recurrentes.',
        });
      }

      if (completionRate >= 60) {
        alerts.push({
          tone: 'positive',
          title: 'Nivel de cierre saludable',
          detail: `${Math.round(completionRate)}% del total ya está resuelto.`,
        });
      }

      if (alerts.length === 0) {
        alerts.push({
          tone: 'neutral',
          title: 'Operación estable',
          detail: 'No se detectan alertas críticas en la revisión actual.',
        });
      }
    }

    return {
      total,
      openTotal,
      byStatus,
      statusSegments,
      categories,
      maxCategoryCount,
      averageResolutionHours,
      completionRate,
      assignedOpen,
      unassignedOpen,
      assignmentRate,
      ageBuckets,
      maxAgeBucketCount,
      criticalBacklog,
      averageOpenAgeHours,
      trend,
      maxTrendCount,
      alerts,
    };
  }, [data]);

  const kpis = useMemo(() => {
    return [
      {
        id: 'total',
        icon: 'ticket',
        tone: 'neutral',
        label: 'Incidentes Totales',
        value: stats.total.toLocaleString('es-CL'),
        detail: 'Base histórica consolidada',
      },
      {
        id: 'open',
        icon: 'exclamationTriangle',
        tone: stats.openTotal > 0 ? 'warning' : 'positive',
        label: 'Backlog Abierto',
        value: stats.openTotal.toLocaleString('es-CL'),
        detail: 'Pendientes + En resolución',
      },
      {
        id: 'completion',
        icon: 'checkBadge',
        tone: stats.completionRate >= 60 ? 'positive' : 'warning',
        label: 'Tasa de Resolución',
        value: `${Math.round(stats.completionRate)}%`,
        detail: 'Proporción de casos cerrados',
      },
      {
        id: 'assignment',
        icon: 'users',
        tone: stats.unassignedOpen > 0 ? 'warning' : 'positive',
        label: 'Backlog Asignado',
        value: `${Math.round(stats.assignmentRate)}%`,
        detail: `${stats.unassignedOpen.toLocaleString('es-CL')} sin asignar`,
      },
      {
        id: 'resolution-time',
        icon: 'clockHistory',
        tone: 'neutral',
        label: 'Tiempo Prom. de Cierre',
        value: formatDuration(stats.averageResolutionHours),
        detail: 'Calculado sobre incidentes cerrados',
      },
      {
        id: 'critical',
        icon: 'scale',
        tone: stats.criticalBacklog > 0 ? 'critical' : 'neutral',
        label: 'Backlog Crítico (>72h)',
        value: stats.criticalBacklog.toLocaleString('es-CL'),
        detail: 'Casos abiertos en riesgo de incumplimiento',
      },
    ];
  }, [stats]);

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

      <section className="incident-stats page-shell page-shell--wide">
        <header className="incident-stats__header page-header">
          <div>
            <p className="eyebrow page-eyebrow">Reportes</p>
            <h1 className="page-title">Estadísticas de Incidentes</h1>
            <p className="subtitle page-subtitle">
              Supervisión operativa para administración de condominios y control de cumplimiento.
            </p>
            <div className="incident-stats__meta">
              <span className="incident-stats__meta-item">
                <Icon name="clockHistory" size={14} />
                Última actualización: {formatDateTime(lastUpdated)}
              </span>
              <span className="incident-stats__meta-item">
                <Icon name="buildingLibrary" size={14} />
                Universo analizado: {stats.total.toLocaleString('es-CL')} incidentes
              </span>
            </div>
          </div>

          <div className="page-actions">
            <button
              type="button"
              className="btn btn-secondary incident-stats__refresh"
              onClick={() => fetchData({ background: true })}
              disabled={refreshing}
            >
              <Icon name="refresh" size={16} className={refreshing ? 'is-spinning' : ''} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </header>

        <section className="incident-stats__kpis" aria-label="Indicadores clave de incidentes">
          {kpis.map((kpi) => (
            <article key={kpi.id} className={`incident-kpi incident-kpi--${kpi.tone}`}>
              <span className="incident-kpi__icon" aria-hidden="true">
                <Icon name={kpi.icon} size={18} />
              </span>
              <div className="incident-kpi__content">
                <p className="incident-kpi__value">{kpi.value}</p>
                <p className="incident-kpi__label">{kpi.label}</p>
                <p className="incident-kpi__detail">{kpi.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="incident-stats__grid" aria-label="Panel analítico de incidentes">
          <article className="incident-panel">
            <header className="incident-panel__header">
              <h3>Estado Operacional</h3>
              <span>Distribución del total de incidentes</span>
            </header>

            {stats.total === 0 ? (
              <p className="incident-panel__empty">No hay datos para mostrar distribución de estado.</p>
            ) : (
              <>
                <div className="status-track" role="img" aria-label="Distribución de incidentes por estado">
                  {stats.statusSegments.map((segment) => (
                    <span
                      key={segment.key}
                      className={`status-track__segment status-track__segment--${segment.key.toLowerCase()}`}
                      style={{ width: `${segment.percent}%`, backgroundColor: segment.color }}
                    />
                  ))}
                </div>

                <div className="status-legend">
                  {stats.statusSegments.map((segment) => (
                    <div key={segment.key} className="status-legend__item">
                      <span className="status-legend__swatch" style={{ backgroundColor: segment.color }} />
                      <span className="status-legend__label">{segment.label}</span>
                      <span className="status-legend__meta">
                        {segment.count.toLocaleString('es-CL')} ({Math.round(segment.percent)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </article>

          <article className="incident-panel">
            <header className="incident-panel__header">
              <h3>Distribución por Categoría</h3>
              <span>Carga comparativa por tipo de incidente</span>
            </header>

            {stats.categories.length === 0 ? (
              <p className="incident-panel__empty">No hay datos para mostrar categorías.</p>
            ) : (
              <div className="category-bars">
                {stats.categories.map((item) => {
                  const width = (item.count / stats.maxCategoryCount) * 100;
                  return (
                    <div key={item.key} className="category-bars__item">
                      <div className="category-bars__head">
                        <span className="category-bars__name">{item.label}</span>
                        <span className="category-bars__meta">
                          {item.count.toLocaleString('es-CL')} ({Math.round(item.percent)}%)
                        </span>
                      </div>
                      <div className="category-bars__track">
                        <span
                          className="category-bars__fill"
                          style={{ width: `${Math.max(width, 3)}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="incident-panel">
            <header className="incident-panel__header">
              <h3>Antigüedad del Backlog</h3>
              <span>Solo incidentes abiertos</span>
            </header>

            {stats.openTotal === 0 ? (
              <p className="incident-panel__empty">No hay backlog abierto en este momento.</p>
            ) : (
              <div className="aging-bars">
                {stats.ageBuckets.map((bucket) => {
                  const width = (bucket.count / stats.maxAgeBucketCount) * 100;
                  return (
                    <div key={bucket.key} className={`aging-bars__item aging-bars__item--${bucket.tone}`}>
                      <span className="aging-bars__label">{bucket.label}</span>
                      <div className="aging-bars__track">
                        <span
                          className="aging-bars__fill"
                          style={{ width: `${Math.max(width, 3)}%` }}
                        />
                      </div>
                      <span className="aging-bars__value">
                        {bucket.count.toLocaleString('es-CL')} ({Math.round(bucket.percent)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="incident-panel__note">
              Edad promedio del backlog: <strong>{formatDuration(stats.averageOpenAgeHours)}</strong>
            </p>
          </article>

          <article className="incident-panel">
            <header className="incident-panel__header">
              <h3>Tendencia de Ingreso</h3>
              <span>Volumen reportado en las últimas {WEEKS_TO_SHOW} semanas</span>
            </header>

            <div className="trend-chart" role="img" aria-label="Tendencia semanal de incidentes">
              {stats.trend.map((point) => {
                const rawHeight = (point.count / stats.maxTrendCount) * 100;
                const height = point.count > 0 ? Math.max(rawHeight, 14) : 4;

                return (
                  <div key={point.label} className="trend-chart__item">
                    <div className="trend-chart__bar-wrap">
                      <span className="trend-chart__value">{point.count.toLocaleString('es-CL')}</span>
                      <span className="trend-chart__bar" style={{ height: `${height}%` }} />
                    </div>
                    <span className="trend-chart__label">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="incident-panel">
            <header className="incident-panel__header">
              <h3>Asignación del Backlog</h3>
              <span>Control de cobertura operativa en incidentes abiertos</span>
            </header>

            {stats.openTotal === 0 ? (
              <p className="incident-panel__empty">No hay backlog abierto para analizar asignaciones.</p>
            ) : (
              <div className="assignment-block">
                <div
                  className="assignment-donut"
                  style={{
                    background: `conic-gradient(var(--color-turquoise) ${stats.assignmentRate}%, #e5e7eb 0)`,
                  }}
                >
                  <div className="assignment-donut__center">
                    <strong>{Math.round(stats.assignmentRate)}%</strong>
                    <small>Asignado</small>
                  </div>
                </div>

                <div className="assignment-block__legend">
                  <div className="assignment-block__legend-item">
                    <span className="assignment-dot assignment-dot--assigned" />
                    <span>Asignados</span>
                    <strong>{stats.assignedOpen.toLocaleString('es-CL')}</strong>
                  </div>
                  <div className="assignment-block__legend-item">
                    <span className="assignment-dot assignment-dot--unassigned" />
                    <span>Sin asignar</span>
                    <strong>{stats.unassignedOpen.toLocaleString('es-CL')}</strong>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className="incident-panel">
            <header className="incident-panel__header">
              <h3>Observaciones de Gestión</h3>
              <span>Lectura ejecutiva para seguimiento administrativo</span>
            </header>

            <div className="ops-list">
              {stats.alerts.map((alert, index) => (
                <div key={`${alert.title}-${index}`} className={`ops-item ops-item--${alert.tone}`}>
                  <h4>{alert.title}</h4>
                  <p>{alert.detail}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </ProtectedLayout>
  );
};

export default AdminIncidentStats;
