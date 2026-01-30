import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import './ResidentPortal.css';

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

/**
 * Resident Portal Page Component
 * Simplified portal for residents with notifications
 */
const ResidentPortal = () => {
    const { user } = useAppContext();

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

    return (
        <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
            <article className="resident-portal">
                <header className="resident-portal__header">
                    <h1>Panel Principal</h1>
                    <p className="resident-portal__welcome">Bienvenido, {displayName}</p>
                    <div className="resident-portal__notice">
                        Recuerda cambiar tu contraseña si fue creada por un administrador. La contraseña por defecto es 1234567890.
                    </div>
                </header>

                <div className="resident-portal__grid">
                    {/* Panel de Notificaciones */}
                    <section className="resident-portal__panel resident-portal__panel--notifications">
                        <div className="resident-portal__panel-header">
                            <span className="resident-portal__panel-icon">🔔</span>
                            <h2>Notificaciones de la Comunidad</h2>
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
                        {mockNotifications.length > 0 && (
                            <button className="resident-portal__view-all-btn">
                                Ver todas las notificaciones
                            </button>
                        )}
                    </section>
                </div>
            </article>
        </ProtectedLayout>
    );
};

export default ResidentPortal;

