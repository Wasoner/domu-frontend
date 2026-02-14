import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { Icon, MarketCarousel } from '../components';
import { ROUTES } from '../constants';
import { api } from '../services';
import './StaffPortal.scss';


const mockNotifications = [
    {
        id: 1,
        type: 'incident',
        category: 'water',
        title: 'Incidente abierto en torre B',
        message: 'Filtracion reportada en pasillo del piso 4. Seguimiento en curso.',
        date: '2026-02-01T09:20:00',
        priority: 'high',
        source: 'Administracion',
        isNew: true,
        to: ROUTES.RESIDENT_INCIDENTS,
    },
    {
        id: 2,
        type: 'parcel',
        title: 'Encomienda disponible en conserjeria',
        message: 'Paquete recibido hoy a las 10:45. Retiralo con tu identificacion.',
        date: '2026-02-01T10:52:00',
        priority: 'medium',
        source: 'Conserjeria',
        isNew: true,
        to: ROUTES.RESIDENT_PARCELS,
    },
    {
        id: 3,
        type: 'visit',
        title: 'Visita autorizada para hoy',
        message: 'Juan Perez ingresara a las 19:30. Recuerda habilitar acceso en porteria.',
        date: '2026-01-31T15:05:00',
        priority: 'low',
        source: 'Accesos',
        to: ROUTES.RESIDENT_EVENTS,
    },
    {
        id: 4,
        type: 'admin',
        title: 'Aviso de administracion',
        message: 'Corte programado de agua el martes 3 de febrero entre 09:00 y 12:00.',
        date: '2026-01-30T08:30:00',
        priority: 'medium',
        source: 'Administracion',
        to: ROUTES.RESIDENT_PUBLICATIONS,
    },
    {
        id: 5,
        type: 'payment',
        title: 'Pago registrado',
        message: 'Confirmamos el pago de tu gasto comun de enero.',
        date: '2026-01-29T12:40:00',
        priority: 'low',
        source: 'Finanzas',
        to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW,
    },
];

const residentQuickActions = [
    {
        id: 'charges',
        title: 'Gastos comunes',
        icon: 'banknotes',
        to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW,
    },
    {
        id: 'incidents',
        title: 'Incidentes',
        icon: 'wrench',
        to: ROUTES.RESIDENT_INCIDENTS,
    },
    {
        id: 'amenities',
        title: 'Reservas',
        icon: 'calendar',
        to: ROUTES.RESIDENT_AMENITIES,
    },
    {
        id: 'parcels',
        title: 'Encomiendas',
        icon: 'archiveBox',
        to: ROUTES.RESIDENT_PARCELS,
    },
];

const staffQuickActions = [
    {
        id: 'publications',
        title: 'Publicaciones',
        icon: 'newspaper',
        to: ROUTES.RESIDENT_PUBLICATIONS,
    },
    {
        id: 'votings',
        title: 'Resultados votaciones',
        icon: 'checkBadge',
        to: ROUTES.VOTINGS,
    },
    {
        id: 'amenities',
        title: 'Areas comunes',
        icon: 'sparkles',
        to: ROUTES.RESIDENT_AMENITIES,
    },
];

const residentUpcomingItems = [
    {
        id: 'payment-dec',
        title: 'Gasto comun diciembre',
        due: 'Vence 20 dic',
    },
    {
        id: 'visit',
        title: 'Visita programada',
        due: '18 dic • 16:00',
    },
];

const INCIDENT_CATEGORIES = {
    water: { label: 'Agua', icon: 'water', color: '#0ea5e9', bg: '#e0f2fe' },
    electricity: { label: 'Electricidad', icon: 'bolt', color: '#f59e0b', bg: '#fff7ed' },
    noise: { label: 'Ruidos', icon: 'speakerWave', color: '#f97316', bg: '#fff7ed' },
    security: { label: 'Seguridad', icon: 'lock', color: '#ef4444', bg: '#fef2f2' },
    maintenance: { label: 'Mantencion', icon: 'wrench', color: '#2563eb', bg: '#eff6ff' },
    cleaning: { label: 'Limpieza', icon: 'sparkles', color: '#10b981', bg: '#ecfdf5' },
    parking: { label: 'Estacionamiento', icon: 'car', color: '#64748b', bg: '#f1f5f9' },
    elevator: { label: 'Ascensor', icon: 'arrowsUpDown', color: '#6366f1', bg: '#eef2ff' },
    general: { label: 'Incidente', icon: 'ticket', color: '#f43f5e', bg: '#fff1f2' },
};

const NOTIFICATION_TYPES = {
    visit: { label: 'Visita', icon: 'door', color: '#0ea5e9', bg: '#e0f2fe' },
    parcel: { label: 'Encomienda', icon: 'cube', color: '#f59e0b', bg: '#fff7ed' },
    admin: { label: 'Administracion', icon: 'bellAlert', color: '#0f766e', bg: '#ecfdf5' },
    payment: { label: 'Pago', icon: 'banknotes', color: '#16a34a', bg: '#ecfdf5' },
    maintenance: { label: 'Mantencion', icon: 'wrench', color: '#6366f1', bg: '#eef2ff' },
};

const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
const taskPriorityLabels = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };
const normalizeTaskStatus = (status) => {
    if (!status) return 'PENDING';
    return String(status).toUpperCase();
};
const mapForumCategoryToNotificationType = (category) => {
    const normalized = String(category || '').toLowerCase();
    if (normalized === 'alert') return 'maintenance';
    if (normalized === 'event') return 'visit';
    if (normalized === 'news') return 'admin';
    return 'admin';
};

const mapForumThreadToNotification = (thread) => ({
    id: `thread-${thread.id}`,
    type: mapForumCategoryToNotificationType(thread.category),
    title: thread.title || 'Publicacion',
    message: thread.content || 'Sin detalles',
    date: thread.date,
    priority: thread.pinned ? 'high' : 'medium',
    source: thread.authorName || 'Administracion',
    isNew: !!thread.pinned,
    to: ROUTES.RESIDENT_PUBLICATIONS,
});

const StaffPortal = () => {
    const { user } = useAppContext();
    const isStaff = user?.roleId === 4 || user?.userType === 'staff';
    const [latestPeriod, setLatestPeriod] = useState(null);
    const [staffTasks, setStaffTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [staffProfile, setStaffProfile] = useState(null);
    const [staffProfileResolved, setStaffProfileResolved] = useState(false);
    const [communityAnnouncements, setCommunityAnnouncements] = useState([]);

    const displayName = user?.firstName
        ? `${user.firstName} ${user?.lastName || ''}`.trim()
        : user?.email || (isStaff ? 'Funcionario' : 'Residente');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
        return date.toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (value) => {
        const safe = Number(value);
        if (!Number.isFinite(safe)) return '-';
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
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

    useEffect(() => {
        if (isStaff) {
            setLatestPeriod(null);
            return undefined;
        }

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
    }, [isStaff]);

    useEffect(() => {
        if (!isStaff) {
            setStaffProfile(null);
            setStaffProfileResolved(false);
            return;
        }

        let isMounted = true;
        const fetchStaffProfile = async () => {
            setStaffProfileResolved(false);
            try {
                const staffData = await api.staff.getMine();
                if (isMounted) {
                    setStaffProfile(staffData || null);
                }
            } catch {
                if (isMounted) {
                    setStaffProfile(null);
                }
            } finally {
                if (isMounted) {
                    setStaffProfileResolved(true);
                }
            }
        };

        fetchStaffProfile();
        return () => { isMounted = false; };
    }, [isStaff]);

    useEffect(() => {
        if (!isStaff || !user?.id) {
            setStaffTasks([]);
            return;
        }
        if (!staffProfileResolved) return;

        let isMounted = true;
        const currentUserId = Number(user.id);
        const currentStaffId = Number(staffProfile?.id);
        const candidateAssigneeIds = [currentStaffId, currentUserId].filter((id) => Number.isFinite(id) && id > 0);

        const statusWeight = (status) => {
            if (status === 'PENDING') return 0;
            if (status === 'IN_PROGRESS') return 1;
            if (status === 'COMPLETED') return 2;
            return 3;
        };

        const fetchTasks = async () => {
            setLoadingTasks(true);
            try {
                const data = await api.tasks.list();
                const list = Array.isArray(data) ? data : [];
                const mine = list
                    .filter((task) => {
                        const assigneeIds = Array.isArray(task.assigneeIds) ? task.assigneeIds.map(Number) : [];
                        const assigneeId = Number(task.assigneeId);
                        const assignedToUserId = Number(task.assignedToUserId);
                        return assigneeIds.some((id) => candidateAssigneeIds.includes(id))
                            || candidateAssigneeIds.includes(assigneeId)
                            || candidateAssigneeIds.includes(assignedToUserId);
                    })
                    .map((task) => ({
                        ...task,
                        status: normalizeTaskStatus(task.status),
                        priority: String(task.priority || 'MEDIUM').toUpperCase(),
                    }))
                    .filter((task) => task.status === 'PENDING' || task.status === 'IN_PROGRESS')
                    .sort((a, b) => statusWeight(a.status) - statusWeight(b.status));

                if (isMounted) setStaffTasks(mine);
            } catch {
                if (isMounted) setStaffTasks([]);
            } finally {
                if (isMounted) setLoadingTasks(false);
            }
        };

        fetchTasks();
        return () => { isMounted = false; };
    }, [isStaff, user, staffProfile, staffProfileResolved]);

    useEffect(() => {
        if (!isStaff) {
            setCommunityAnnouncements([]);
            return;
        }

        let isMounted = true;
        const fetchAnnouncements = async () => {
            try {
                const data = await api.forum.list();
                if (!isMounted) return;
                const threads = Array.isArray(data) ? data : [];
                const mapped = threads
                    .map(mapForumThreadToNotification)
                    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                setCommunityAnnouncements(mapped);
            } catch {
                if (isMounted) {
                    setCommunityAnnouncements([]);
                }
            }
        };

        fetchAnnouncements();
        return () => { isMounted = false; };
    }, [isStaff]);

    const notifications = useMemo(() => {
        if (!isStaff) return mockNotifications;
        return communityAnnouncements;
    }, [isStaff, communityAnnouncements]);

    const quickActions = isStaff ? staffQuickActions : residentQuickActions;

    const pendingTasks = staffTasks.filter((task) => task.status === 'PENDING').length;
    const inProgressTasks = staffTasks.filter((task) => task.status === 'IN_PROGRESS').length;

    const staffStats = [
        { id: 'pending', label: 'Tareas pendientes', value: pendingTasks, note: 'Asignadas a ti', tone: 'warn' },
        { id: 'progress', label: 'En progreso', value: inProgressTasks, note: 'Trabajo activo', tone: 'info' },
        { id: 'announcements', label: 'Publicaciones', value: notifications.length, note: 'Comunicados visibles', tone: 'info' },
    ];

    const residentStats = [
        {
            id: 'balance',
            label: 'Cuota mensual',
            value: latestPeriod ? formatCurrency(latestPeriod.totalAmount) : '-',
            note: latestPeriod ? `Vence ${new Date(latestPeriod.dueDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}` : 'Sin periodos',
            tone: latestPeriod ? (latestPeriod.pendingAmount <= 0 ? 'ok' : 'warn') : 'info',
        },
        { id: 'reservations', label: 'Reservas activas', value: '2', note: 'Proxima: Quincho', tone: 'info' },
        { id: 'incidents', label: 'Incidentes abiertos', value: '1', note: 'En revision', tone: 'alert' },
        { id: 'payments', label: 'Pagos al dia', value: '3', note: 'Ultimo pago nov', tone: 'ok' },
    ];

    const portalStats = isStaff ? staffStats : residentStats;
    const upcomingItems = residentUpcomingItems;

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
            <article className="resident-portal page-shell page-shell--wide">
                <header className="resident-portal__header">
                    <div>
                        <p className="resident-portal__eyebrow">{isStaff ? 'Portal del funcionario' : 'Portal del residente'}</p>
                        <h1>Hola, {displayName}</h1>
                        <p className="resident-portal__subtitle">
                            {isStaff
                                ? 'Resumen de tareas asignadas y publicaciones de la comunidad.'
                                : 'Resumen de tu comunidad y accesos rapidos'}
                        </p>
                    </div>
                </header>

                <section className="resident-portal__stats">
                    {portalStats.map((stat) => (
                        <div key={stat.id} className={`resident-portal__stat resident-portal__stat--${stat.tone}`}>
                            <span className="resident-portal__stat-label">{stat.label}</span>
                            <strong className="resident-portal__stat-value">{stat.value}</strong>
                            <span className="resident-portal__stat-note">{stat.note}</span>
                        </div>
                    ))}
                </section>

                {!isStaff && <MarketCarousel />}

                <div className="resident-portal__grid">
                    <section className="resident-portal__main">
                        <section className="resident-portal__panel resident-portal__panel--notifications">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">
                                    <Icon name="bellAlert" size={18} />
                                </span>
                                <div>
                                    <h2>{isStaff ? 'Publicaciones de la comunidad' : 'Notificaciones de la comunidad'}</h2>
                                    <p>{isStaff ? 'Comunicados y avisos importantes' : 'Mensajes relevantes para tu edificio'}</p>
                                </div>
                            </div>
                            <div className="resident-portal__notifications-list">
                                {notifications.length === 0 && (
                                    <div className="resident-portal__upcoming-item">
                                        <strong>No hay publicaciones nuevas</strong>
                                        <small>Revisa nuevamente mas tarde.</small>
                                    </div>
                                )}
                                {notifications.map((notification) => {
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
                                <span className="resident-portal__panel-icon">
                                    <Icon name={isStaff ? 'clipboardCheck' : 'calendar'} size={18} />
                                </span>
                                <h2>{isStaff ? 'Tareas asignadas' : 'Proximos eventos'}</h2>
                            </div>
                            <div className="resident-portal__upcoming-list">
                                {isStaff ? (
                                    <>
                                        {loadingTasks && (
                                            <div className="resident-portal__upcoming-item">
                                                <strong>Cargando tareas</strong>
                                                <small>Actualizando...</small>
                                            </div>
                                        )}

                                        {!loadingTasks && staffTasks.length === 0 && (
                                            <div className="resident-portal__upcoming-item">
                                                <strong>Sin tareas activas</strong>
                                                <small>No tienes tareas pendientes ni en progreso.</small>
                                            </div>
                                        )}

                                        {!loadingTasks && staffTasks.map((task) => {
                                            const priority = taskPriorityLabels[task.priority] || task.priority || 'Media';

                                            return (
                                                <div key={`task-${task.id}`} className="resident-portal__upcoming-item resident-portal__upcoming-item--task">
                                                    <div className="resident-portal__upcoming-task-info">
                                                        <strong>{task.title || 'Tarea sin titulo'}</strong>
                                                        <small>{`Prioridad ${priority}`}</small>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    upcomingItems.map((item) => (
                                        <div key={item.id} className="resident-portal__upcoming-item">
                                            <strong>{item.title}</strong>
                                            <small>{item.due}</small>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="resident-portal__panel resident-portal__panel--quick">
                            <div className="resident-portal__panel-header">
                                <span className="resident-portal__panel-icon">
                                    <Icon name="bolt" size={18} />
                                </span>
                                <h2>Accesos rapidos</h2>
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

export default StaffPortal;

