import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { Icon } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './Dashboard.scss';

/**
 * Módulos de acceso rápido - Enlaces funcionales a páginas principales
 */
const quickAccessModules = [
    {
        id: 'charges',
        title: 'Gastos Comunes',
        description: 'Gestiona periodos y cargos',
        icon: 'banknotes',
        to: ROUTES.COMMON_CHARGES,
        accentColor: 'var(--color-turquoise)',
    },
    {
        id: 'incidents',
        title: 'Incidentes',
        description: 'Gestiona tickets y reportes',
        icon: 'ticket',
        to: ROUTES.ADMIN_INCIDENTS,
        accentColor: 'var(--color-warning-light)',
    },
    {
        id: 'amenities',
        title: 'Áreas Comunes',
        description: 'Reservas y espacios',
        icon: 'calendar',
        to: ROUTES.RESIDENT_AMENITIES,
        accentColor: 'var(--color-info-light)',
    },
    {
        id: 'residents',
        title: 'Residentes',
        description: 'Administrar comunidad',
        icon: 'home',
        to: ROUTES.ADMIN_RESIDENTS,
        accentColor: 'var(--color-success)',
    },
    {
        id: 'parcels',
        title: 'Encomiendas',
        description: 'Gestión de paquetes',
        icon: 'archiveBox',
        to: ROUTES.ADMIN_PARCELS,
        accentColor: 'var(--color-info)',
    },
    {
        id: 'tasks',
        title: 'Tareas Staff',
        description: 'Asignar y monitorear',
        icon: 'clipboardDocumentCheck',
        to: ROUTES.ADMIN_TASKS,
        accentColor: 'var(--color-primary)',
    },
    {
        id: 'users',
        title: 'Usuarios',
        description: 'Crear y administrar cuentas',
        icon: 'user',
        to: ROUTES.ADMIN_CREATE_USER,
        accentColor: 'var(--color-gray-dark)',
    },
    {
        id: 'profile',
        title: 'Configuración',
        description: 'Ajustes de la cuenta',
        icon: 'settings',
        to: ROUTES.RESIDENT_PROFILE,
        accentColor: 'var(--color-gray)',
    },
];

/**
 * Dashboard Administrativo
 * Panel principal con métricas en tiempo real y accesos rápidos
 */
const Dashboard = () => {
    const { user, buildingVersion } = useAppContext();
    const [stats, setStats] = useState({
        reported: 0,
        inProgress: 0,
        closed: 0,
        totalResidents: 0,
        activeResidents: 0,
        latestPeriodTotal: 0,
        activeMarketItems: 0,
    });
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [recentMarketItems, setRecentMarketItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);
    const isFetchingRef = useRef(false);
    const lastFetchKeyRef = useRef(null);
    const isInitialLoading = !hasFetched;

    const userName = useMemo(() => {
        if (!user) return 'Administrador';
        return user.firstName || user.email?.split('@')[0] || 'Administrador';
    }, [user]);

    const fetchData = useCallback(async () => {
        if (!user || isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [incidentData, residentData, periodData, marketData] = await Promise.all([
                api.incidents.listMine(),
                api.adminUsers.getResidents(),
                api.finance.listPeriods(),
                api.market.listItems({ status: 'AVAILABLE' })
            ]);

            // Process incidents
            const reported = incidentData?.reported || [];
            const inProgress = incidentData?.inProgress || [];
            const closed = incidentData?.closed || [];

            // Process residents
            const residents = residentData || [];
            
            // Process periods
            const latestPeriod = periodData && periodData.length > 0 ? periodData[0] : null;

            // Process market
            const marketItems = marketData || [];

            setStats({
                reported: reported.length,
                inProgress: inProgress.length,
                closed: closed.length,
                totalResidents: residents.length,
                activeResidents: residents.filter(r => r.status === 'ACTIVE').length,
                latestPeriodTotal: latestPeriod?.totalAmount || 0,
                activeMarketItems: marketItems.length,
            });

            // Últimos 5 incidentes más recientes
            const allIncidents = [...reported, ...inProgress]
                .map((item) => ({
                    id: item.id,
                    title: item.title,
                    category: item.category || 'general',
                    status: (item.status || 'REPORTED').toUpperCase(),
                    createdAt: item.createdAt || item.updatedAt || item.date,
                }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setRecentIncidents(allIncidents);
            setRecentMarketItems(marketItems.slice(0, 3));
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
        } finally {
            setLoading(false);
            setHasFetched(true);
            isFetchingRef.current = false;
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const key = `${user.id || user.email || 'anon'}-${buildingVersion ?? '0'}`;
        if (lastFetchKeyRef.current !== key) {
            lastFetchKeyRef.current = key;
            fetchData();
        }
        const interval = setInterval(fetchData, 30000); // Actualizar cada 30s
        return () => clearInterval(interval);
    }, [fetchData, buildingVersion, user]);

    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    const formatIncidentDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
    };

    const getStatusLabel = (status) => {
        const labels = {
            REPORTED: 'Reportado',
            IN_PROGRESS: 'En progreso',
            CLOSED: 'Cerrado',
        };
        return labels[status] || status;
    };

    const openIncidents = stats.reported + stats.inProgress;
    const statusTone = openIncidents === 0 ? 'ok' : openIncidents < 4 ? 'warn' : 'alert';
    const statusMessage = openIncidents === 0
        ? 'Todo bajo control'
        : openIncidents < 4
            ? 'Atención requerida'
            : 'Carga alta';
    const statusDetail = openIncidents === 0
        ? 'No tienes incidentes pendientes en este momento.'
        : openIncidents < 4
            ? `Hay ${openIncidents} casos abiertos que necesitan seguimiento.`
            : 'Revisa prioridades y asigna responsables.';

    return (
        <ProtectedLayout allowedRoles={['admin', 'concierge']}>
            <article className="dashboard page-shell page-shell--wide" aria-label="Panel administrativo">
                {/* Header compacto */}
                <header className="dashboard__header page-header">
                    <div className="dashboard__greeting">
                        <p className="dashboard__eyebrow page-eyebrow">Panel administrativo</p>
                        <h1 className="page-title">Hola, {userName}</h1>
                        <p className="dashboard__subtitle page-subtitle">
                            Resumen de tu comunidad
                        </p>
                    </div>
                    <div className="dashboard__actions page-actions">
                        {lastUpdated && (
                            <span className="dashboard__sync">
                                Actualizado a las {formatTime(lastUpdated)}
                            </span>
                        )}
                        <button
                            type="button"
                            className="dashboard__refresh"
                            onClick={fetchData}
                            disabled={loading}
                        >
                            {loading ? 'Actualizando...' : 'Actualizar'}
                        </button>
                    </div>
                </header>

                {/* Métricas principales - Clickables */}
                <section className="dashboard__metrics" aria-label="Métricas de incidentes">
                    {isInitialLoading ? (
                        <>
                            {[0, 1, 2].map((key) => (
                                <div key={key} className="metric-card metric-card--skeleton" aria-hidden="true">
                                    <div className="metric-card__content">
                                        <span className="dashboard__skeleton-block dashboard__skeleton-block--xl" />
                                        <span className="dashboard__skeleton-block dashboard__skeleton-block--md" />
                                    </div>
                                    <span className="dashboard__skeleton-block dashboard__skeleton-block--lg" />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <Link to={ROUTES.ADMIN_INCIDENTS} className="metric-card metric-card--warning">
                                <div className="metric-card__content">
                                    <span className="metric-card__value">{stats.reported}</span>
                                    <span className="metric-card__label">Incidentes pendientes</span>
                                </div>
                                <span className="metric-card__indicator">Requieren atención</span>
                            </Link>

                            <Link to={ROUTES.ADMIN_RESIDENTS} className="metric-card metric-card--info">
                                <div className="metric-card__content">
                                    <span className="metric-card__value">{stats.totalResidents}</span>
                                    <span className="metric-card__label">Residentes</span>
                                </div>
                                <span className="metric-card__indicator">{stats.activeResidents} activos en el sistema</span>
                            </Link>

                            <Link to={ROUTES.COMMON_CHARGES} className="metric-card metric-card--success">
                                <div className="metric-card__content">
                                    <span className="metric-card__value" style={{ fontSize: '1.75rem' }}>{formatCurrency(stats.latestPeriodTotal)}</span>
                                    <span className="metric-card__label">Último Gasto Común</span>
                                </div>
                                <span className="metric-card__indicator">Monto total facturado</span>
                            </Link>
                        </>
                    )}
                </section>

                {/* Contenido principal en dos columnas */}
                <div className="dashboard__grid">
                    <section className="dashboard__primary">
                        {/* Feed de incidentes recientes */}
                        <section className="dashboard__feed" aria-label="Incidentes recientes">
                            <div className="dashboard__feed-header">
                                <div>
                                    <h2>Actividad reciente</h2>
                                    <p>Últimos incidentes reportados</p>
                                </div>
                                <div className="dashboard__feed-actions">
                                    <Link to={ROUTES.ADMIN_INCIDENTS} className="dashboard__view-all">
                                        Ver todo
                                    </Link>
                                </div>
                            </div>

                            <div className="dashboard__feed-list">
                                {isInitialLoading && (
                                    <div className="dashboard__feed-skeleton" aria-hidden="true">
                                        {[0, 1, 2].map((key) => (
                                            <div key={key} className="dashboard__feed-skeleton-row">
                                                <span className="dashboard__skeleton-block dashboard__skeleton-block--sm" />
                                                <span className="dashboard__skeleton-block dashboard__skeleton-block--xl" />
                                                <span className="dashboard__skeleton-block dashboard__skeleton-block--md" />
                                                <span className="dashboard__skeleton-block dashboard__skeleton-block--sm" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!loading && hasFetched && recentIncidents.length === 0 && (
                                    <div className="dashboard__feed-empty">
                                        <span className="dashboard__feed-empty-icon">
                                            <Icon name="check" size={24} />
                                        </span>
                                        <p>Sin incidentes pendientes</p>
                                        <small>Todo está en orden</small>
                                    </div>
                                )}

                                {recentIncidents.map((incident) => (
                                    <Link
                                        key={incident.id}
                                        to={ROUTES.ADMIN_INCIDENTS}
                                        className="incident-item"
                                    >
                                        <div className="incident-item__main">
                                            <span className="incident-item__category">
                                                {incident.category}
                                            </span>
                                            <p className="incident-item__title">{incident.title}</p>
                                            <span className="incident-item__time">
                                                {formatIncidentDate(incident.createdAt)}
                                            </span>
                                        </div>
                                        <span className={`incident-item__status incident-item__status--${incident.status.toLowerCase()}`}>
                                            {getStatusLabel(incident.status)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Mercado de la comunidad */}
                        <section className="dashboard__market" aria-label="Productos destacados">
                            <div className="dashboard__feed-header">
                                <div>
                                    <h2>Tienda vecinal</h2>
                                    <p>Últimos productos publicados</p>
                                </div>
                                <div className="dashboard__feed-actions">
                                    <Link to={ROUTES.RESIDENT_MARKETPLACE} className="dashboard__view-all">
                                        Ver tienda
                                    </Link>
                                </div>
                            </div>

                            <div className="dashboard__market-grid">
                                {isInitialLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="market-card-mini-skeleton" />
                                    ))
                                ) : recentMarketItems.length === 0 ? (
                                    <div className="dashboard__feed-empty">
                                        <p>No hay productos activos</p>
                                    </div>
                                ) : (
                                    recentMarketItems.map(item => (
                                        <Link key={item.id} to={ROUTES.RESIDENT_MARKETPLACE} className="market-card-mini">
                                            <div className="market-card-mini__img">
                                                {item.mainImageUrl ? (
                                                    <img src={item.mainImageUrl} alt={item.title} />
                                                ) : (
                                                    <Icon name="archiveBox" size={24} />
                                                )}
                                            </div>
                                            <div className="market-card-mini__info">
                                                <h4>{item.title}</h4>
                                                <span>{formatCurrency(item.price)}</span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>
                    </section>

                    <aside className="dashboard__side">
                        {isInitialLoading ? (
                            <section className="dashboard__status-card dashboard__status-card--skeleton" aria-hidden="true">
                                <div>
                                    <span className="dashboard__skeleton-block dashboard__skeleton-block--sm" />
                                    <span className="dashboard__skeleton-block dashboard__skeleton-block--lg" />
                                    <span className="dashboard__skeleton-block dashboard__skeleton-block--xl" />
                                </div>
                                <span className="dashboard__skeleton-block dashboard__skeleton-block--md" />
                            </section>
                        ) : (
                            <section className={`dashboard__status-card dashboard__status-card--${statusTone}`}>
                                <div>
                                    <p className="dashboard__status-eyebrow">Estado de la comunidad</p>
                                    <h3>{statusMessage}</h3>
                                    <p>{statusDetail}</p>
                                </div>
                                <Link to={ROUTES.ADMIN_INCIDENTS} className="dashboard__status-link">
                                    Gestionar casos
                                </Link>
                            </section>
                        )}

                        {/* Accesos rápidos */}
                        <section className="dashboard__quick-access" aria-label="Accesos rápidos">
                            <div className="dashboard__quick-header">
                                <h2>Gestión directa</h2>
                                <span>Atajos a herramientas clave</span>
                            </div>
                            <div className="dashboard__modules">
                                {isInitialLoading ? (
                                    Array.from({ length: 6 }, (_, index) => (
                                        <div key={index} className="module-card module-card--skeleton" aria-hidden="true">
                                            <span className="module-card__icon" />
                                            <div className="module-card__content">
                                                <span className="dashboard__skeleton-block dashboard__skeleton-block--md" />
                                                <span className="dashboard__skeleton-block dashboard__skeleton-block--lg" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    quickAccessModules.map((module) => (
                                        <Link
                                            key={module.id}
                                            to={module.to}
                                            className="module-card"
                                            style={{ '--module-accent': module.accentColor }}
                                        >
                                            <span className="module-card__icon" aria-hidden="true">
                                                <Icon name={module.icon} size={20} />
                                            </span>
                                            <div className="module-card__content">
                                                <h3>{module.title}</h3>
                                                <p>{module.description}</p>
                                            </div>
                                            <span className="module-card__arrow" aria-hidden="true">
                                                <Icon name="chevronRight" size={16} />
                                            </span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </article>
        </ProtectedLayout>
    );
};

export default Dashboard;
