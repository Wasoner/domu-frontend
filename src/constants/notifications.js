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
  visit: { label: 'Visita', icon: 'door', color: '#0ea5e9', bg: '#e0f2fe' },
  parcel: { label: 'Encomienda', icon: 'cube', color: '#f59e0b', bg: '#fff7ed' },
  admin: { label: 'Administracion', icon: 'bellAlert', color: '#0f766e', bg: '#ecfdf5' },
  payment: { label: 'Pago', icon: 'banknotes', color: '#16a34a', bg: '#ecfdf5' },
  maintenance: { label: 'Mantencion', icon: 'wrench', color: '#6366f1', bg: '#eef2ff' },
};

export const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'incident',
    category: 'water',
    title: 'Incidente abierto en torre B',
    detail: 'Piso 4 • Seguimiento en curso',
    message: 'Filtracion reportada en pasillo del piso 4. Seguimiento en curso.',
    date: '2026-02-01T09:20:00',
    timeLabel: 'Hace 12 min',
    priority: 'high',
    source: 'Administracion',
    isNew: true,
    to: ROUTES.RESIDENT_INCIDENTS,
  },
  {
    id: 2,
    type: 'parcel',
    title: 'Encomienda disponible en conserjeria',
    detail: 'Paquete recibido a las 10:45',
    message: 'Paquete recibido hoy a las 10:45. Retiralo con tu identificacion.',
    date: '2026-02-01T10:52:00',
    timeLabel: 'Hace 1 h',
    priority: 'medium',
    source: 'Conserjeria',
    isNew: true,
    to: ROUTES.RESIDENT_PARCELS,
  },
  {
    id: 3,
    type: 'visit',
    title: 'Visita autorizada para hoy',
    detail: 'Juan Perez • Hoy 19:30',
    message: 'Juan Perez ingresara a las 19:30. Recuerda habilitar acceso en porteria.',
    date: '2026-01-31T15:05:00',
    timeLabel: 'Hoy',
    priority: 'low',
    source: 'Accesos',
    to: ROUTES.RESIDENT_EVENTS,
  },
  {
    id: 4,
    type: 'admin',
    title: 'Aviso de administracion',
    detail: 'Corte programado martes 3',
    message: 'Corte programado de agua el martes 3 de febrero entre 09:00 y 12:00.',
    date: '2026-01-30T08:30:00',
    timeLabel: 'Ayer',
    priority: 'medium',
    source: 'Administracion',
    to: ROUTES.RESIDENT_PUBLICATIONS,
  },
  {
    id: 5,
    type: 'payment',
    title: 'Pago registrado',
    detail: 'Gasto comun de enero confirmado',
    message: 'Confirmamos el pago de tu gasto comun de enero.',
    date: '2026-01-29T12:40:00',
    timeLabel: 'Jue',
    priority: 'low',
    source: 'Finanzas',
    to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW,
  },
];

export const getNotificationVisual = (notification) => {
  if (notification.type === 'incident') {
    const categoryKey = notification.category || 'general';
    const category = INCIDENT_CATEGORIES[categoryKey] || INCIDENT_CATEGORIES.general;
    return {
      ...category,
      tag: `Incidente • ${category.label}`,
    };
  }

  const meta = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.admin;
  return { ...meta, tag: meta.label };
};
