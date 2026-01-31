import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { ROUTES } from '../constants';
import { api } from '../services';
import './ResidentPortal.scss';

// Datos de ejemplo para notificaciones
const mockNotifications = [
    {
        id: 1,
        type: 'announcement',
        title: 'Nueva asamblea de copropietarios',
        message: 'Se convoca a asamblea extraordinaria el próximo viernes 15 de diciembre a las 19:00 hrs.',
        date: '2024-12-10',
        priority: 'high'
    },
    {
        id: 2,
        type: 'payment',
        title: 'Recordatorio de pago',
        message: 'Tu gasto común de noviembre está próximo a vencer. Fecha límite: 20 de diciembre.',
        date: '2024-12-08',
        priority: 'medium'
    },
    {
        id: 3,
        type: 'maintenance',
        title: 'Mantención de ascensores',
        message: 'Se realizará mantención preventiva de los ascensores el día 18 de diciembre.',
        date: '2024-12-05',
        priority: 'low'
    },
];

const quickActions = [
    {
        id: 'charges',
        title: 'Gastos comunes',
        description: 'Revisa tu cartola y pagos',
        icon: '💳',
        to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW,
    },
    {
        id: 'incidents',
        title: 'Incidentes',
        description: 'Reporta y sigue solicitudes',
        icon: '🛠️',
        to: ROUTES.RESIDENT_INCIDENTS,
    },
    {
        id: 'amenities',
        title: 'Reservas',
        description: 'Agenda espacios comunes',
        icon: '📅',
        to: ROUTES.RESIDENT_AMENITIES,
    },
    {
        id: 'parcels',
        title: 'Encomiendas',
        description: 'Consulta entregas',
        icon: '📦',
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

/**
 * Resident Portal Page Component
 * Simplified portal for residents with notifications
 */
const ResidentPortal = () => {
    const { user } = useAppContext();
    const [latestPeriod, setLatestPeriod] = useState(null);

    const displayName = user?.firstName
        ? `${user.firstName} ${user?.lastName || ''}`.trim()
        : user?.email || 'Residente';

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'announcement': return '📢';
            case 'payment': return '💳';
            case 'maintenance': return '🔧';
            default: return '📌';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const formatCurrency = (value) => {
        const safe = Number(value);
        if (!Number.isFinite(safe)) return '—';
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
            .format(safe);
    };

    const formatDueDate = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    };

    useEffect(() => {
        let isMounted = true;
        const fetchLatestPeriod = async () => {
            try {
                const data = await api.finance.listMyPeriods();
                const list = Array.isArray(data) ? data : [];
                if (!isMounted) return;
                setLatestPeriod(list.length > 0 ? list[0] : null);
            } catch (error) {
                if (isMounted) {
                    setLatestPeriod(null);
                }
            }
        };
        fetchLatestPeriod();
        return () => {
            isMounted = false;
        };
    }, []);

    const dueLabel = formatDueDate(latestPeriod?.dueDate);
    const status = latestPeriod?.status;
    const statusNote = status === 'PAID'
        ? 'Pagado'
        : status === 'PARTIAL'
            ? `Pago parcial${dueLabel ? ` • Vence ${dueLabel}` : ''}`
            : dueLabel
                ? `Vence ${dueLabel}`
                : 'Sin fecha de vencimiento';
    const balanceNote = latestPeriod
        ? `Reparto equitativo • ${statusNote}`
        : 'Sin periodos publicados';
    const balanceTone = latestPeriod
        ? (Number(latestPeriod?.pendingAmount) <= 0 ? 'ok' : 'warn')
        : 'info';
    const balanceValue = latestPeriod ? formatCurrency(latestPeriod?.totalAmount) : '—';

    const residentStats = [
        {
            id: 'balance',
            label: 'Cuota mensual',
            value: balanceValue,
            note: balanceNote,
            tone: balanceTone,
        },
        {
            id: 'reservations',
            label: 'Reservas activas',
            value: '2',
            note: 'Próxima: Quincho',
            tone: 'info',
        },
        {
            id: 'incidents',
            label: 'Incidentes abiertos',
            value: '1',
            note: 'En revisión',
            tone: 'alert',
        },
        {
            id: 'payments',
            label: 'Pagos al día',
            value: '3',
            note: 'Último pago nov',
            tone: 'ok',
        },
    ];

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <article className="resident-portal">
                <header className="resident-portal__header">
                    <div>
                        <p className="resident-portal__eyebrow">Portal del residente</p>
                        <h1>Hola, {displayName}</h1>
                        <p className="resident-portal__subtitle">Resumen de tu comunidad y accesos rápidos</p>
                    </div>
                    <div className="resident-portal__header-actions">
                        <Link to={ROUTES.RESIDENT_CHARGES_DETAIL_VIEW} className="resident-portal__header-link">
                            Ver gastos comunes
                        </Link>
                    </div>
                </header>

                <div className="resident-portal__alert" role="status">
                    <span className="resident-portal__alert-icon" aria-hidden="true">🔐</span>
                    <div>
                        <strong>Seguridad recomendada</strong>
                        <p>Si tu contraseña fue creada por un administrador, cámbiala cuanto antes.</p>
                    </div>
                </div>

                <section className="resident-portal__stats" aria-label="Indicadores principales">
                    {residentStats.map((stat) => (
                        <div key={stat.id} className={`resident-portal__stat resident-portal__stat--${stat.tone}`}>
                            <span className="resident-portal__stat-label">{stat.label}</span>
                            <strong className="resident-portal__stat-value">{stat.value}</strong>
                            <span className="resident-portal__stat-note">{stat.note}</span>
                        </div>
                    ))}
                </section>

                <div className="resident-portal__grid">
                    <section className="resident-portal__main">
                        {/* Panel de Notificaciones */}
                        <section className="resident-portal__panel resident-portal__panel--notifications">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">🔔</span>
                                <div>
                                    <h2>Notificaciones de la comunidad</h2>
                                    <p>Mensajes relevantes para tu edificio</p>
                                </div>
                                <Link to={ROUTES.RESIDENT_PUBLICATIONS} className="resident-portal__panel-link">
                                    Ver todo
                                </Link>
                            </div>
                            <div className="resident-portal__notifications-list">
                                {mockNotifications.length > 0 ? (
                                    mockNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`resident-portal__notification resident-portal__notification--${notification.priority}`}
                                        >
                                            <div className="resident-portal__notification-header">
                                                <span className="resident-portal__notification-icon">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <div className="resident-portal__notification-info">
                                                    <h3>{notification.title}</h3>
                                                    <span className="resident-portal__notification-date">
                                                        {formatDate(notification.date)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="resident-portal__notification-message">
                                                {notification.message}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="resident-portal__empty-state">
                                        <p>No hay notificaciones nuevas</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </section>

                    <aside className="resident-portal__side">
                        <section className="resident-portal__panel resident-portal__panel--upcoming">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">🗓️</span>
                                <div>
                                    <h2>Próximos eventos</h2>
                                    <p>Fechas relevantes del mes</p>
                                </div>
                            </div>
                            <div className="resident-portal__upcoming-list">
                                {upcomingItems.map((item) => (
                                    <div key={item.id} className="resident-portal__upcoming-item">
                                        <div>
                                            <strong>{item.title}</strong>
                                            <span>{item.detail}</span>
                                        </div>
                                        <small>{item.due}</small>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="resident-portal__panel resident-portal__panel--quick">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">⚡</span>
                                <div>
                                    <h2>Accesos rápidos</h2>
                                    <p>Atajos a tareas frecuentes</p>
                                </div>
                            </div>
                            <div className="resident-portal__quick-grid">
                                {quickActions.map((action) => (
                                    <Link key={action.id} to={action.to} className="resident-portal__quick-card">
                                        <span className="resident-portal__quick-icon" aria-hidden="true">
                                            {action.icon}
                                        </span>
                                        <div>
                                            <strong>{action.title}</strong>
                                            <span>{action.description}</span>
                                        </div>
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
