import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import { ROUTES } from '../constants';
import './Dashboard.css';

/**
 * Módulos de acceso rápido - Enlaces funcionales a páginas principales
 */
const quickAccessModules = [
    {
        id: 'incidents',
        title: 'Incidentes',
        description: 'Gestiona tickets y reportes',
        icon: '🎫',
        to: ROUTES.ADMIN_INCIDENTS,
        accentColor: 'var(--color-warning-light)',
    },
    {
        id: 'users',
        title: 'Usuarios',
        description: 'Crear y administrar cuentas',
        icon: '👤',
        to: ROUTES.ADMIN_CREATE_USER,
        accentColor: 'var(--color-info-light)',
    },
    {
        id: 'visits',
        title: 'Visitas',
        description: 'Accesos y autorizaciones',
        icon: '🚪',
        to: ROUTES.RESIDENT_EVENTS,
        accentColor: 'var(--color-turquoise)',
    },
    {
        id: 'profile',
        title: 'Configuración',
        description: 'Ajustes de la cuenta',
        icon: '⚙️',
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
    const [incidentStats, setIncidentStats] = useState({
        reported: 0,
        inProgress: 0,
        closed: 0,
    });
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const userName = useMemo(() => {
        if (!user) return 'Administrador';
        return user.firstName || user.email?.split('@')[0] || 'Administrador';
    }, [user]);

    const fetchIncidentData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await api.incidents.listMine();
            const reported = data?.reported || [];
            const inProgress = data?.inProgress || [];
            const closed = data?.closed || [];

            setIncidentStats({
                reported: reported.length,
                inProgress: inProgress.length,
                closed: closed.length,
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
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error cargando datos de incidentes:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchIncidentData();
        const interval = setInterval(fetchIncidentData, 30000); // Actualizar cada 30s
        return () => clearInterval(interval);
    }, [fetchIncidentData, buildingVersion]); // Recargar cuando cambia el edificio

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

    const getStatusLabel = (status) => {
        const labels = {
            REPORTED: 'Reportado',
            IN_PROGRESS: 'En progreso',
            CLOSED: 'Cerrado',
        };
        return labels[status] || status;
    };

    return (
        <ProtectedLayout allowedRoles={['admin', 'concierge']}>
            <article className="dashboard" aria-label="Panel administrativo">
                {/* Header compacto */}
                <header className="dashboard__header">
                    <div className="dashboard__greeting">
                        <h1>Hola, {userName}</h1>
                        <p className="dashboard__subtitle">
                            Resumen de tu comunidad
                        </p>
                    </div>
                    {lastUpdated && (
                        <span className="dashboard__sync">
                            Actualizado a las {formatTime(lastUpdated)}
                        </span>
                    )}
                </header>

                {/* Métricas principales - Clickables */}
                <section className="dashboard__metrics" aria-label="Métricas de incidentes">
                    <Link to={ROUTES.ADMIN_INCIDENTS} className="metric-card metric-card--warning">
                        <div className="metric-card__content">
                            <span className="metric-card__value">{incidentStats.reported}</span>
                            <span className="metric-card__label">Reportados</span>
                        </div>
                        <span className="metric-card__indicator">Pendientes de atención</span>
                    </Link>

                    <Link to={ROUTES.ADMIN_INCIDENTS} className="metric-card metric-card--info">
                        <div className="metric-card__content">
                            <span className="metric-card__value">{incidentStats.inProgress}</span>
                            <span className="metric-card__label">En progreso</span>
                        </div>
                        <span className="metric-card__indicator">En gestión activa</span>
                    </Link>

                    <Link to={ROUTES.ADMIN_INCIDENTS} className="metric-card metric-card--success">
                        <div className="metric-card__content">
                            <span className="metric-card__value">{incidentStats.closed}</span>
                            <span className="metric-card__label">Cerrados</span>
                        </div>
                        <span className="metric-card__indicator">Resueltos este mes</span>
                    </Link>
                </section>

                {/* Contenido principal en dos columnas */}
                <div className="dashboard__grid">
                    {/* Feed de incidentes recientes */}
                    <section className="dashboard__feed" aria-label="Incidentes recientes">
                        <div className="dashboard__feed-header">
                            <div>
                                <h2>Actividad reciente</h2>
                                <p>Últimos incidentes reportados</p>
                            </div>
                            <div className="dashboard__feed-actions">
                                <button
                                    type="button"
                                    className="dashboard__refresh-btn"
                                    onClick={fetchIncidentData}
                                    disabled={loading}
                                    aria-label="Actualizar datos"
                                >
                                    {loading ? '...' : '↻'}
                                </button>
                                <Link to={ROUTES.ADMIN_INCIDENTS} className="dashboard__view-all">
                                    Ver todo
                                </Link>
                            </div>
                        </div>

                        <div className="dashboard__feed-list">
                            {loading && recentIncidents.length === 0 && (
                                <div className="dashboard__feed-empty">
                                    Cargando incidentes...
                                </div>
                            )}

                            {!loading && recentIncidents.length === 0 && (
                                <div className="dashboard__feed-empty">
                                    <span className="dashboard__feed-empty-icon">✓</span>
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

                    {/* Accesos rápidos */}
                    <section className="dashboard__quick-access" aria-label="Accesos rápidos">
                        <h2>Accesos rápidos</h2>
                        <div className="dashboard__modules">
                            {quickAccessModules.map((module) => (
                                <Link
                                    key={module.id}
                                    to={module.to}
                                    className="module-card"
                                    style={{ '--module-accent': module.accentColor }}
                                >
                                    <span className="module-card__icon" aria-hidden="true">
                                        {module.icon}
                                    </span>
                                    <div className="module-card__content">
                                        <h3>{module.title}</h3>
                                        <p>{module.description}</p>
                                    </div>
                                    <span className="module-card__arrow" aria-hidden="true">→</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </article>
        </ProtectedLayout>
    );
};

export default Dashboard;
