import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { VisitRegistrationPanel } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import './Dashboard.css';

const priorityWidgets = [
    {
        icon: '💳',
        title: 'Cobranzas pendientes',
        metric: '12',
        helper: 'Revisa pagos vencidos de esta semana.',
        action: 'Ir a pagos',
    },
    {
        icon: '🚨',
        title: 'Tickets urgentes',
        metric: '5',
        helper: 'Incidentes críticos en progreso.',
        action: 'Ver incidentes',
    },
    {
        icon: '🛂',
        title: 'Visitas de hoy',
        metric: '8',
        helper: 'Preavisos registrados para conserjería.',
        action: 'Ver accesos',
    },
];

const quickShortcuts = [
    { label: 'Comunidades', detail: 'Estado y ocupación', icon: '🏢' },
    { label: 'Residentes', detail: 'Contactos y unidades', icon: '👥' },
    { label: 'Reportes', detail: 'Finanzas y tickets', icon: '📈' },
];

const nextActions = [
    'Confirmar pagos vencidos antes de las 12:00.',
    'Priorizar tickets con SLA < 4h.',
    'Coordinar accesos programados y avisar a conserjería.',
];

const Dashboard = () => {
    const { user } = useAppContext();
    const [incidentFeed, setIncidentFeed] = useState([]);
    const [loadingIncidents, setLoadingIncidents] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const userName = useMemo(() => {
        if (!user) return 'Administrador';
        return user.firstName || user.email || 'Administrador';
    }, [user]);

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
            setIncidentFeed(flatten);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('No pudimos cargar incidentes en tiempo real', error);
        } finally {
            setLoadingIncidents(false);
        }
    }, [user]);

    useEffect(() => {
        fetchIncidentFeed();
        const interval = setInterval(fetchIncidentFeed, 15000);
        return () => clearInterval(interval);
    }, [fetchIncidentFeed]);

    return (
        <ProtectedLayout allowedRoles={['admin', 'concierge']}>
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

                <section className="widget-grid" aria-label="Prioridades del día">
                    {priorityWidgets.map((widget) => (
                        <article className="widget-card" key={widget.title}>
                            <div className="widget-card__top">
                                <span className="widget-card__icon" aria-hidden="true">
                                    {widget.icon}
                                </span>
                                <p className="widget-card__action">{widget.action}</p>
                            </div>
                            <h3>{widget.title}</h3>
                            <div className="widget-card__metric">{widget.metric}</div>
                            <p className="widget-card__helper">{widget.helper}</p>
                        </article>
                    ))}
                </section>

                <section className="realtime-panel" aria-label="Incidentes en tiempo real">
                    <div className="realtime-panel__header">
                        <div>
                            <p className="realtime-panel__eyebrow">Tiempo real</p>
                            <h2>Incidentes recientes</h2>
                            <p className="realtime-panel__helper">
                                Se actualiza automáticamente cuando cualquier usuario reporta.
                            </p>
                        </div>
                        <div className="realtime-panel__actions">
                            <Link to={ROUTES.RESIDENT_INCIDENTS} className="realtime-panel__cta">
                                Ir al panel completo
                            </Link>
                            <button
                                type="button"
                                className="realtime-panel__refresh"
                                onClick={fetchIncidentFeed}
                                disabled={loadingIncidents}
                            >
                                {loadingIncidents ? 'Actualizando...' : 'Actualizar ahora'}
                            </button>
                            {lastUpdated && (
                                <span className="realtime-panel__timestamp">
                                    Última sync: {lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="realtime-panel__list" role="list">
                        {loadingIncidents && incidentFeed.length === 0 && (
                            <div className="realtime-panel__empty">Cargando incidentes...</div>
                        )}
                        {!loadingIncidents && incidentFeed.length === 0 && (
                            <div className="realtime-panel__empty">
                                Sin incidentes recientes. Todo en orden.
                            </div>
                        )}
                        {incidentFeed.map((incident, index) => (
                            <div
                                key={incident.id || `${incident.title}-${index}`}
                                className="realtime-panel__item"
                                role="listitem"
                            >
                                <div className="realtime-panel__item-top">
                                    <span className="realtime-panel__category">
                                        {incident.category}
                                    </span>
                                    <span className={`realtime-panel__status realtime-panel__status--${incident.status.toLowerCase()}`}>
                                        {incident.status === 'REPORTED' && 'Reportado'}
                                        {incident.status === 'IN_PROGRESS' && 'En progreso'}
                                        {incident.status === 'CLOSED' && 'Cerrado'}
                                    </span>
                                </div>
                                <p className="realtime-panel__title">{incident.title}</p>
                                <span className="realtime-panel__time">
                                    {incident.createdAt
                                        ? new Date(incident.createdAt).toLocaleString('es-CL', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : 'Sin fecha'}
                                </span>
                                {index < incidentFeed.length - 1 && <div className="realtime-panel__divider" aria-hidden="true" />}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="split-panels" aria-label="Atajos y próximos pasos">
                    <div className="panel panel--shortcuts">
                        <div className="panel__header">
                            <h2>Atajos clave</h2>
                            <p>Solo lo necesario para comenzar el día.</p>
                        </div>
                        <ul className="shortcut-list">
                            {quickShortcuts.map((item) => (
                                <li key={item.label} className="shortcut-item">
                                    <span aria-hidden="true">{item.icon}</span>
                                    <div>
                                        <strong>{item.label}</strong>
                                        <p>{item.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="panel panel--actions">
                        <div className="panel__header">
                            <h2>Prioridades inmediatas</h2>
                            <p>Checklist rápida antes de abrir el correo.</p>
                        </div>
                        <ol className="actions-list">
                            {nextActions.map((task) => (
                                <li key={task}>{task}</li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section aria-label="Registro rápido de visitas">
                    <VisitRegistrationPanel user={user} />
                </section>
            </article>
        </ProtectedLayout>
    );
};

export default Dashboard;

