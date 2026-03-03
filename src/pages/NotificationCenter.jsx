import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { Icon } from '../components';
import { api } from '../services';
import { ROUTES } from '../constants';
import { getNotificationVisual, getNotificationRoute, NOTIFICATION_TYPES } from '../constants/notifications';
import './NotificationCenter.scss';

const NotificationCenter = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchNotifications = useCallback(async (pageNum = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      const data = await api.notifications.list(pageNum, 20);
      const items = Array.isArray(data) ? data : [];
      if (append) {
        setNotifications((prev) => [...prev, ...items]);
      } else {
        setNotifications(items);
      }
      setHasMore(items.length === 20);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(0);
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.notifications.markRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
    const route = getNotificationRoute(notification);
    if (route) navigate(route);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filtered = filterType === 'ALL'
    ? notifications
    : notifications.filter((n) => n.type === filterType);

  const typeOptions = [
    { value: 'ALL', label: 'Todas' },
    ...Object.entries(NOTIFICATION_TYPES).map(([key, val]) => ({ value: key, label: val.label })),
  ];

  return (
    <ProtectedLayout>
      <div className="notification-center">
        <div className="notification-center__header">
          <h1 className="notification-center__title">Notificaciones</h1>
          <div className="notification-center__actions">
            <button
              type="button"
              className="notification-center__btn notification-center__btn--secondary"
              onClick={() => navigate(ROUTES.NOTIFICATION_PREFERENCES)}
            >
              <Icon name="settings" size={16} />
              Preferencias
            </button>
            <button
              type="button"
              className="notification-center__btn notification-center__btn--primary"
              onClick={handleMarkAllRead}
            >
              Marcar todas como leidas
            </button>
          </div>
        </div>

        <div className="notification-center__filter">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="notification-center__select"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="notification-center__list">
          {loading && notifications.length === 0 ? (
            <div className="notification-center__loading">Cargando notificaciones...</div>
          ) : filtered.length === 0 ? (
            <div className="notification-center__empty">
              <Icon name="bellAlert" size={48} />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            filtered.map((notification) => {
              const visual = getNotificationVisual(notification);
              return (
                <button
                  key={notification.id}
                  type="button"
                  className={`notification-center__item ${!notification.isRead ? 'notification-center__item--unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span
                    className="notification-center__icon"
                    style={{ '--notif-color': visual.color, '--notif-bg': visual.bg }}
                  >
                    <Icon name={visual.icon} size={20} />
                  </span>
                  <div className="notification-center__content">
                    <div className="notification-center__item-header">
                      <span className="notification-center__tag">{visual.tag}</span>
                      <span className="notification-center__time">{formatTime(notification.createdAt)}</span>
                    </div>
                    <span className="notification-center__item-title">{notification.title}</span>
                    <span className="notification-center__item-message">{notification.message}</span>
                  </div>
                  {!notification.isRead && (
                    <span className="notification-center__dot" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {hasMore && filtered.length > 0 && (
          <div className="notification-center__load-more">
            <button
              type="button"
              className="notification-center__btn notification-center__btn--secondary"
              onClick={handleLoadMore}
            >
              Cargar mas
            </button>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default NotificationCenter;
