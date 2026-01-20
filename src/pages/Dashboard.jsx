import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { Seo, Spinner } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './Dashboard.css';

const adminActions = [
    {
        icon: '💳',
        title: 'Pagos y cobranzas',
        description: 'Revisa estados de pago y conciliaciones.',
        to: ROUTES.PAYMENTS,
    },
    {
        icon: '👥',
        title: 'Residentes',
        description: 'Administra perfiles y unidades.',
        to: ROUTES.RESIDENTS,
    },
];

const CATEGORY_LABELS = {
    security: 'Seguridad',
    maintenance: 'Mantenimiento',
    noise: 'Ruido',
    cleaning: 'Limpieza',
    access: 'Accesos',
    concierge: 'Conserjería',
    general: 'General',
    other: 'Otros',
};

const Dashboard = () => {
    const { user } = useAppContext();
    const [incidentFeed, setIncidentFeed] = useState([]);
    const [loadingIncidents, setLoadingIncidents] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const userName = useMemo(() => {
        if (!user) return 'Administrador';
        return user.firstName || user.email || 'Administrador';
    }, [user]);

    const computeSignature = useCallback((items) => {
        return items
            .map((item) => `${item.id}-${item.status}-${item.createdAt}`)
            .join('|');
    }, []);

    const fetchIncidentFeed = useCallback(async () => {
        if (!user) return;
        setLoadingIncidents(true);
        try {
            const data = await api.incidents.listMine();
            const flatten = [
                ...(data?.reported || []),
                ...(data?.inProgress || []),
                ...(data?.closed || []),
            ]
                .map((item) => ({
                    id: item.id,
                    title: item.title,
                    category: item.category || 'general',
                    status: (item.status || 'REPORTED').toUpperCase(),
                    createdAt: item.createdAt || item.updatedAt || item.date,
                }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 8);
            setIncidentFeed((prev) => {
                const previousSignature = computeSignature(prev);
                const nextSignature = computeSignature(flatten);
                if (previousSignature !== nextSignature) {
                    setLastUpdated(new Date());
                }
                return flatten;
            });
        } catch (error) {
            console.error('No pudimos cargar incidentes en tiempo real', error);
        } finally {
            setLoadingIncidents(false);
        }
    }, [user, computeSignature]);

    const getCategoryLabel = useCallback((category) => {
        const key = (category || 'general').toString().trim().toLowerCase();
        return CATEGORY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }, []);

    useEffect(() => {
        fetchIncidentFeed();
        const interval = setInterval(fetchIncidentFeed, 15000);
        return () => clearInterval(interval);
    }, [fetchIncidentFeed]);

    return (
        <ProtectedLayout allowedRoles={['admin', 'concierge']}>
            <Seo
                title="Dashboard administrativo | Domu"
                description="Panel privado para administrar comunidades, incidentes y accesos en Domu."
                canonicalPath="/dashboard"
                noindex
            />
            <article className="dashboard-page" aria-label="Resumen administrativo">
                <header className="dashboard-hero">
                    <div>
                        <p className="hero-eyebrow">Inicio rápido</p>
                        <h1>Dashboard Administrativo</h1>
                        <p className="hero-subtitle">
                            Bienvenido, {userName}. Enfócate en lo urgente: cobros, tickets y accesos.
                        </p>
                    </div>
                    <div className="hero-hint">
                        <span>🔒 Sesión activa</span>
                        <small>Rol: {user?.userType || 'Administrador'}</small>
                    </div>
                </header>

                <section className="admin-actions" aria-label="Accesos rápidos">
                    <div className="admin-actions__header">
                        <h2>Accesos rápidos</h2>
                        <p>Herramientas esenciales para operar el día a día.</p>
                    </div>
                    <div className="admin-actions__grid">
                        {adminActions.map((action) => (
                            <Link to={action.to} key={action.title} className="admin-action-card">
                                <span className="admin-action-card__icon" aria-hidden="true">
                                    {action.icon}
                                </span>
                                <div>
                                    <h3>{action.title}</h3>
                                    <p>{action.description}</p>
                                </div>
                                <span className="admin-action-card__cta">Entrar</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="admin-activity" aria-label="Actividad reciente de incidentes">
                    <header className="admin-activity__header">
                        <div>
                            <p className="admin-activity__eyebrow">Actividad</p>
                            <h2>Incidentes recientes</h2>
                            <p className="admin-activity__helper">
                                Últimos movimientos reportados.
                            </p>
                        </div>
                        <div className="admin-activity__actions">
                            <Link to={ROUTES.ADMIN_INCIDENTS} className="admin-activity__cta">
                                Ver panel completo
                            </Link>
                            {lastUpdated && (
                                <span className="admin-activity__timestamp">
                                    {lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </header>

                    <div className="admin-activity__list" role="list">
                        {loadingIncidents && incidentFeed.length === 0 && (
                            <div className="admin-activity__empty">
                                <Spinner label="Cargando incidentes..." />
                            </div>
                        )}
                        {!loadingIncidents && incidentFeed.length === 0 && (
                            <div className="admin-activity__empty">
                                Sin novedades por ahora.
                            </div>
                        )}
                        {incidentFeed.slice(0, 4).map((incident, index) => (
                            <div
                                key={incident.id || `${incident.title}-${index}`}
                                className="admin-activity__item"
                                role="listitem"
                            >
                                <div className="admin-activity__item-meta">
                                    <span className="admin-activity__category">
                                        {getCategoryLabel(incident.category)}
                                    </span>
                                    <span className={`admin-activity__status admin-activity__status--${incident.status.toLowerCase()}`}>
                                        {incident.status === 'REPORTED' && 'Reportado'}
                                        {incident.status === 'IN_PROGRESS' && 'En progreso'}
                                        {incident.status === 'CLOSED' && 'Cerrado'}
                                    </span>
                                    <span className="admin-activity__time">
                                        {incident.createdAt
                                            ? new Date(incident.createdAt).toLocaleString('es-CL', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : 'Sin fecha'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </article>
        </ProtectedLayout>
    );
};

export default Dashboard;

