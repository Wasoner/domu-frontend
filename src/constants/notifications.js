import { ROUTES } from './routes';

export const INCIDENT_CATEGORIES = {
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

export const NOTIFICATION_TYPES = {
  INCIDENT_CREATED:        { label: 'Incidente creado',     icon: 'ticket',    color: '#f43f5e', bg: '#fff1f2' },
  INCIDENT_ASSIGNED:       { label: 'Incidente asignado',   icon: 'ticket',    color: '#f97316', bg: '#fff7ed' },
  INCIDENT_STATUS_CHANGED: { label: 'Estado de incidente',  icon: 'ticket',    color: '#6366f1', bg: '#eef2ff' },
  VISIT_AUTHORIZED:        { label: 'Visita autorizada',    icon: 'door',      color: '#0ea5e9', bg: '#e0f2fe' },
  VISIT_CHECKED_IN:        { label: 'Check-in de visita',   icon: 'door',      color: '#10b981', bg: '#ecfdf5' },
  PARCEL_RECEIVED:         { label: 'Encomienda recibida',  icon: 'cube',      color: '#f59e0b', bg: '#fff7ed' },
  PARCEL_COLLECTED:        { label: 'Encomienda retirada',  icon: 'cube',      color: '#16a34a', bg: '#ecfdf5' },
  CHARGE_PERIOD_CREATED:   { label: 'Gasto comun',          icon: 'banknotes', color: '#0f766e', bg: '#ecfdf5' },
  PAYMENT_CONFIRMED:       { label: 'Pago confirmado',      icon: 'banknotes', color: '#16a34a', bg: '#ecfdf5' },
  TASK_ASSIGNED:           { label: 'Tarea asignada',       icon: 'wrench',    color: '#2563eb', bg: '#eff6ff' },
  TASK_COMPLETED:          { label: 'Tarea completada',     icon: 'wrench',    color: '#10b981', bg: '#ecfdf5' },
  POLL_CREATED:            { label: 'Nueva votacion',       icon: 'chartBar',  color: '#8b5cf6', bg: '#f5f3ff' },
  POLL_CLOSED:             { label: 'Votacion cerrada',     icon: 'chartBar',  color: '#64748b', bg: '#f1f5f9' },
  RESERVATION_CONFIRMED:   { label: 'Reserva confirmada',   icon: 'calendar',  color: '#0ea5e9', bg: '#e0f2fe' },
  RESERVATION_CANCELLED:   { label: 'Reserva cancelada',    icon: 'calendar',  color: '#ef4444', bg: '#fef2f2' },
  FORUM_THREAD_CREATED:    { label: 'Nueva publicacion',    icon: 'chatBubbleLeftRight', color: '#6366f1', bg: '#eef2ff' },
  ADMIN_ANNOUNCEMENT:      { label: 'Aviso administracion', icon: 'bellAlert', color: '#0f766e', bg: '#ecfdf5' },
  MARKET_ITEM_CREATED:     { label: 'Nuevo en marketplace', icon: 'shoppingBag', color: '#f59e0b', bg: '#fff7ed' },
  CHAT_REQUEST_RECEIVED:   { label: 'Solicitud de chat',    icon: 'chatBubbleLeftRight', color: '#0ea5e9', bg: '#e0f2fe' },
  CHAT_REQUEST_ACCEPTED:   { label: 'Chat aceptado',        icon: 'chatBubbleLeftRight', color: '#10b981', bg: '#ecfdf5' },
  MAINTENANCE_SCHEDULED:   { label: 'Mantenimiento programado', icon: 'wrench', color: '#2563eb', bg: '#eff6ff' },
  MAINTENANCE_COMPLETED:   { label: 'Mantenimiento completado', icon: 'wrench', color: '#10b981', bg: '#ecfdf5' },
};

export const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export const getNotificationRoute = (notification) => {
  if (!notification || !notification.type) return null;
  const type = notification.type;
  const routes = {
    INCIDENT_CREATED:        ROUTES.ADMIN_INCIDENTS,
    INCIDENT_ASSIGNED:       ROUTES.ADMIN_INCIDENTS,
    INCIDENT_STATUS_CHANGED: ROUTES.RESIDENT_INCIDENTS,
    VISIT_AUTHORIZED:        ROUTES.RESIDENT_EVENTS,
    VISIT_CHECKED_IN:        ROUTES.RESIDENT_EVENTS,
    PARCEL_RECEIVED:         ROUTES.RESIDENT_PARCELS,
    PARCEL_COLLECTED:        ROUTES.ADMIN_PARCELS,
    CHARGE_PERIOD_CREATED:   ROUTES.RESIDENT_CHARGES_DETAIL_VIEW,
    PAYMENT_CONFIRMED:       ROUTES.COMMON_CHARGES,
    TASK_ASSIGNED:           ROUTES.ADMIN_TASKS,
    TASK_COMPLETED:          ROUTES.ADMIN_TASKS,
    POLL_CREATED:            ROUTES.VOTINGS,
    POLL_CLOSED:             ROUTES.VOTINGS,
    RESERVATION_CONFIRMED:   ROUTES.RESIDENT_AMENITIES,
    RESERVATION_CANCELLED:   ROUTES.RESIDENT_AMENITIES,
    FORUM_THREAD_CREATED:    ROUTES.RESIDENT_PUBLICATIONS,
    ADMIN_ANNOUNCEMENT:      ROUTES.RESIDENT_PUBLICATIONS,
    MARKET_ITEM_CREATED:     ROUTES.RESIDENT_MARKETPLACE,
    CHAT_REQUEST_RECEIVED:   ROUTES.RESIDENT_CHAT,
    CHAT_REQUEST_ACCEPTED:   ROUTES.RESIDENT_CHAT,
    MAINTENANCE_SCHEDULED:   ROUTES.ADMIN_TASKS,
    MAINTENANCE_COMPLETED:   ROUTES.ADMIN_TASKS,
  };
  return routes[type] || null;
};

export const getNotificationVisual = (notification) => {
  const meta = NOTIFICATION_TYPES[notification.type];
  if (meta) {
    return { ...meta, tag: meta.label };
  }
  // Fallback
  return { label: 'Notificacion', icon: 'bellAlert', color: '#64748b', bg: '#f1f5f9', tag: 'Notificacion' };
};
