import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { Icon, MarketCarousel } from '../components';
import { ROUTES } from '../constants';
import { api } from '../services';
import './ResidentPortal.scss';

// Datos de ejemplo para notificaciones (El sistema que mencionaste)
const mockNotifications = [
    {
        id: 1,
        type: 'incident',
        category: 'water',
        title: 'Incidente abierto en torre B',
        message: 'Filtración reportada en pasillo del piso 4. Seguimiento en curso.',
        date: '2026-02-01T09:20:00',
        priority: 'high',
        source: 'Administración',
        isNew: true,
        to: ROUTES.RESIDENT_INCIDENTS,
    },
    {
        id: 2,
        type: 'parcel',
        title: 'Encomienda disponible en conserjería',
        message: 'Paquete recibido hoy a las 10:45. Retíralo con tu identificación.',
        date: '2026-02-01T10:52:00',
        priority: 'medium',
        source: 'Conserjería',
        isNew: true,
        to: ROUTES.RESIDENT_PARCELS,
    },
    {
        id: 3,
        type: 'visit',
        title: 'Visita autorizada para hoy',
        message: 'Juan Pérez ingresará a las 19:30. Recuerda habilitar acceso en portería.',
        date: '2026-01-31T15:05:00',
        priority: 'low',
        source: 'Accesos',
        to: ROUTES.RESIDENT_EVENTS,
    },
    {
        id: 4,
        type: 'admin',
        title: 'Aviso de administración',
        message: 'Corte programado de agua el martes 3 de febrero entre 09:00 y 12:00.',
        date: '2026-01-30T08:30:00',
        priority: 'medium',
        source: 'Administración',
        to: ROUTES.RESIDENT_PUBLICATIONS,
    },
    {
        id: 5,
        type: 'payment',
        title: 'Pago registrado',
        message: 'Confirmamos el pago de tu gasto común de enero.',
        date: '2026-01-29T12:40:00',
        priority: 'low',
        source: 'Finanzas',
        to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW,
    },
];

const quickActions = [
    {
        id: 'charges',
        title: 'Gastos comunes',
        description: 'Revisa tu cartola y pagos',
        icon: 'banknotes',
        to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW,
    },
    {
        id: 'incidents',
        title: 'Incidentes',
        description: 'Reporta y sigue solicitudes',
        icon: 'wrench',
        to: ROUTES.RESIDENT_INCIDENTS,
    },
    {
        id: 'amenities',
        title: 'Reservas',
        description: 'Agenda espacios comunes',
        icon: 'calendar',
        to: ROUTES.RESIDENT_AMENITIES,
    },
    {
        id: 'parcels',
        title: 'Encomiendas',
        description: 'Consulta entregas',
        icon: 'archiveBox',
        to: ROUTES.RESIDENT_PARCELS,
    },
];

const upcomingItems = [
    {
        id: 'payment-dec',
        title: 'Gasto común diciembre',
        detail: 'Monto estimado $78.500',
        due: 'Vence 20 dic',
    },
    {
        id: 'visit',
        title: 'Visita programada',
        detail: 'Proveedor eléctrico',
        due: '18 dic • 16:00',
    },
];

const ResidentPortal = () => {
    const { user } = useAppContext();
    const [latestPeriod, setLatestPeriod] = useState(null);

    const displayName = user?.firstName
        ? `${user.firstName} ${user?.lastName || ''}`.trim()
        : user?.email || 'Residente';

    const INCIDENT_CATEGORIES = {
        water: { label: 'Agua', icon: 'water', color: '#0ea5e9', bg: '#e0f2fe' },
        electricity: { label: 'Electricidad', icon: 'bolt', color: '#f59e0b', bg: '#fff7ed' },
        noise: { label: 'Ruidos', icon: 'speakerWave', color: '#f97316', bg: '#fff7ed' },
        security: { label: 'Seguridad', icon: 'lock', color: '#ef4444', bg: '#fef2f2' },
        maintenance: { label: 'Mantención', icon: 'wrench', color: '#2563eb', bg: '#eff6ff' },
        cleaning: { label: 'Limpieza', icon: 'sparkles', color: '#10b981', bg: '#ecfdf5' },
        parking: { label: 'Estacionamiento', icon: 'car', color: '#64748b', bg: '#f1f5f9' },
        elevator: { label: 'Ascensor', icon: 'arrowsUpDown', color: '#6366f1', bg: '#eef2ff' },
        general: { label: 'Incidente', icon: 'ticket', color: '#f43f5e', bg: '#fff1f2' },
    };

    const NOTIFICATION_TYPES = {
        visit: { label: 'Visita', icon: 'door', color: '#0ea5e9', bg: '#e0f2fe' },
        parcel: { label: 'Encomienda', icon: 'cube', color: '#f59e0b', bg: '#fff7ed' },
        admin: { label: 'Administración', icon: 'bellAlert', color: '#0f766e', bg: '#ecfdf5' },
        payment: { label: 'Pago', icon: 'banknotes', color: '#16a34a', bg: '#ecfdf5' },
        maintenance: { label: 'Mantención', icon: 'wrench', color: '#6366f1', bg: '#eef2ff' },
    };

    const getNotificationVisual = (notification) => {
        if (notification.type === 'incident') {
            const categoryKey = notification.category || 'general';
            const category = INCIDENT_CATEGORIES[categoryKey] || INCIDENT_CATEGORIES.general;
            return { ...category, tag: `Incidente • ${category.label}` };
        }
        const meta = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.admin;
        return { ...meta, tag: meta.label };
    };

    const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
        return date.toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (value) => {
        const safe = Number(value);
        if (!Number.isFinite(safe)) return '—';
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
    };

    useEffect(() => {
        let isMounted = true;
        const fetchLatestPeriod = async () => {
            try {
                const data = await api.finance.listMyPeriods();
                if (!isMounted) return;
                setLatestPeriod(data && data.length > 0 ? data[0] : null);
            } catch {
                if (isMounted) setLatestPeriod(null);
            }
        };
        fetchLatestPeriod();
        return () => { isMounted = false; };
    }, []);

    const residentStats = [
        {
            id: 'balance',
            label: 'Cuota mensual',
            value: latestPeriod ? formatCurrency(latestPeriod.totalAmount) : '—',
            note: latestPeriod ? `Vence ${new Date(latestPeriod.dueDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}` : 'Sin periodos',
            tone: latestPeriod ? (latestPeriod.pendingAmount <= 0 ? 'ok' : 'warn') : 'info',
        },
        { id: 'reservations', label: 'Reservas activas', value: '2', note: 'Próxima: Quincho', tone: 'info' },
        { id: 'incidents', label: 'Incidentes abiertos', value: '1', note: 'En revisión', tone: 'alert' },
        { id: 'payments', label: 'Pagos al día', value: '3', note: 'Último pago nov', tone: 'ok' },
    ];

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <article className="resident-portal page-shell page-shell--wide">
                <header className="resident-portal__header">
                    <div>
                        <p className="resident-portal__eyebrow">Portal del residente</p>
                        <h1>Hola, {displayName}</h1>
                        <p className="resident-portal__subtitle">Resumen de tu comunidad y accesos rápidos</p>
                    </div>
                </header>

                <section className="resident-portal__stats">
                    {residentStats.map((stat) => (
                        <div key={stat.id} className={`resident-portal__stat resident-portal__stat--${stat.tone}`}>
                            <span className="resident-portal__stat-label">{stat.label}</span>
                            <strong className="resident-portal__stat-value">{stat.value}</strong>
                            <span className="resident-portal__stat-note">{stat.note}</span>
                        </div>
                    ))}
                </section>

                <MarketCarousel />

                <div className="resident-portal__grid">
                    <section className="resident-portal__main">
                        <section className="resident-portal__panel resident-portal__panel--notifications">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">🔔</span>
                                <div>
                                    <h2>Notificaciones de la comunidad</h2>
                                    <p>Mensajes relevantes para tu edificio</p>
                                </div>
                            </div>
                            <div className="resident-portal__notifications-list">
                                {mockNotifications.map((notification) => {
                                    const visual = getNotificationVisual(notification);
                                    return (
                                        <Link key={notification.id} to={notification.to} className={`resident-portal__notification ${notification.isNew ? 'is-new' : ''}`}>
                                            <span className="resident-portal__notification-icon" style={{ '--notif-color': visual.color, '--notif-bg': visual.bg }}>
                                                <Icon name={visual.icon} size={18} />
                                            </span>
                                            <div className="resident-portal__notification-body">
                                                <h3>{notification.title}</h3>
                                                <p className="resident-portal__notification-message">{notification.message}</p>
                                                <div className="resident-portal__notification-meta">
                                                    <span className="resident-portal__notification-tag">{visual.tag}</span>
                                                    <span className={`resident-portal__notification-pill resident-portal__notification-pill--${notification.priority}`}>
                                                        {priorityLabels[notification.priority]}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="resident-portal__notification-aside">
                                                <span className="resident-portal__notification-date">{formatDate(notification.date)}</span>
                                                <Icon name="chevronRight" size={16} />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    </section>

                    <aside className="resident-portal__side">
                        <section className="resident-portal__panel resident-portal__panel--upcoming">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">🗓️</span>
                                <h2>Próximos eventos</h2>
                            </div>
                            <div className="resident-portal__upcoming-list">
                                {upcomingItems.map((item) => (
                                    <div key={item.id} className="resident-portal__upcoming-item">
                                        <strong>{item.title}</strong>
                                        <small>{item.due}</small>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="resident-portal__panel resident-portal__panel--quick">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">⚡</span>
                                <h2>Accesos rápidos</h2>
                            </div>
                            <div className="resident-portal__quick-grid">
                                {quickActions.map((action) => (
                                    <Link key={action.id} to={action.to} className="resident-portal__quick-card">
                                        <span className="resident-portal__quick-icon">
                                            <Icon name={action.icon} size={20} />
                                        </span>
                                        <strong>{action.title}</strong>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </article>
        </ProtectedLayout>
    );
};

export default ResidentPortal;
