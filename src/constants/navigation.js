import { ROUTES } from './routes';

export const NAV_SECTIONS = [
  {
    title: 'Inicio',
    roles: ['resident', 'staff'],
    items: [
      { label: 'Panel principal', icon: '🏠', to: ROUTES.RESIDENT_PORTAL, roles: ['resident', 'staff'], exact: true },
    ],
  },
  {
    title: 'Administración',
    roles: ['admin', 'concierge'],
    items: [
      { label: 'Dashboard', icon: '📊', to: ROUTES.DASHBOARD, roles: ['admin', 'concierge'], exact: true },
      { label: 'Crear usuarios', icon: '➕', to: ROUTES.ADMIN_CREATE_USER, roles: ['admin'], exact: true },
      { label: 'Incidentes', icon: '🚨', to: ROUTES.ADMIN_INCIDENTS, roles: ['admin', 'concierge'], exact: true },
      { label: 'Áreas comunes', icon: '🏊', to: ROUTES.ADMIN_AMENITIES, roles: ['admin', 'concierge'], exact: true },
      { label: 'Comunidades', icon: '🏢', roles: ['admin'] },
      { label: 'Residentes', icon: '👥', roles: ['admin'] },
      { label: 'Gastos comunes', icon: '💳', roles: ['admin'] },
      { label: 'Pagos', icon: '💰', roles: ['admin'] },
    ],
  },
  {
    title: 'Propiedad',
    roles: ['resident', 'staff'],
    items: [
      { label: 'Cartola', icon: '💳', to: ROUTES.RESIDENT_CARTOLA, roles: ['resident', 'staff'], exact: true },
      { label: 'Detalle del gasto común', icon: '🧾', to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW, roles: ['resident', 'staff'], exact: true },
      { label: 'Encomiendas', icon: '📦', to: ROUTES.RESIDENT_PARCELS, roles: ['resident', 'staff'], exact: true },
      { label: 'Visitas', icon: '🧑‍🤝‍🧑', to: ROUTES.RESIDENT_EVENTS, roles: ['resident', 'concierge', 'admin'], exact: true },
      { label: 'Medidores', icon: '🔢', to: ROUTES.RESIDENT_METERS, roles: ['resident', 'staff'], exact: true },
    ],
  },
  {
    title: 'Comunidad',
    roles: ['resident', 'admin', 'concierge', 'staff'],
    items: [
      { label: 'Publicaciones', icon: '📢', to: ROUTES.RESIDENT_PUBLICATIONS, roles: ['resident', 'staff'], exact: true },
      { label: 'Votaciones', icon: '🗳️', to: ROUTES.VOTINGS, roles: ['resident', 'admin', 'concierge', 'staff'], exact: true },
      { label: 'Egresos', icon: '💸', to: ROUTES.RESIDENT_EXPENSES, roles: ['resident', 'staff'], exact: true },
      { label: 'Incidentes', icon: '🚨', to: ROUTES.RESIDENT_INCIDENTS, roles: ['resident', 'staff'], exact: true },
      { label: 'Fondos', icon: '🏦', to: ROUTES.RESIDENT_FUNDS, roles: ['resident', 'staff'], exact: true },
      { label: 'Biblioteca', icon: '📚', to: ROUTES.RESIDENT_LIBRARY, roles: ['resident', 'concierge', 'staff'], exact: true },
    ],
  },
  {
    title: 'Herramientas',
    roles: ['resident', 'admin', 'concierge', 'staff'],
    items: [
      { label: 'Reservas', icon: '📅', to: ROUTES.RESIDENT_AMENITIES, roles: ['resident', 'admin', 'concierge', 'staff'], exact: true },
      { label: 'Mi perfil', icon: '🙍‍♂️', to: ROUTES.RESIDENT_PROFILE, roles: ['resident', 'staff'], exact: true },
      { label: 'Anuncios', icon: '📣', roles: ['admin', 'concierge'] },
      { label: 'Reportes', icon: '📈', roles: ['admin'] },
    ],
  },
];
