import { ROUTES } from './routes';

export const NAV_SECTIONS = [
  {
    title: 'Inicio',
    roles: ['resident', 'staff', 'admin', 'concierge'],
    items: [
      { label: 'Panel principal', icon: 'home', to: ROUTES.RESIDENT_PORTAL, roles: ['resident', 'staff', 'admin', 'concierge'], exact: true },
    ],
  },
  {
    title: 'Comunidad',
    roles: ['resident', 'admin', 'concierge', 'staff'],
    items: [
      { label: 'Publicaciones', icon: 'newspaper', to: ROUTES.RESIDENT_PUBLICATIONS, roles: ['resident', 'admin', 'concierge', 'staff'], exact: true },
      { label: 'Tienda comunidad', icon: 'shoppingBag', to: ROUTES.RESIDENT_MARKETPLACE, roles: ['resident', 'admin', 'concierge', 'staff'], exact: true },
      { label: 'Mensajes / Chat', icon: 'chatBubbleLeftRight', to: ROUTES.RESIDENT_CHAT, roles: ['resident', 'admin', 'concierge', 'staff'], exact: true },
      {
        label: 'Incidentes',
        icon: 'ticket',
        roles: ['admin', 'concierge', 'resident', 'staff'],
        subItems: [
          { label: 'Tablero Jira', to: ROUTES.ADMIN_INCIDENTS, roles: ['admin', 'concierge'], exact: true },
          { label: 'Reportar incidente', to: ROUTES.RESIDENT_INCIDENTS, roles: ['admin', 'concierge', 'resident', 'staff'], exact: true },
          { label: 'Estadísticas', to: ROUTES.ADMIN_INCIDENT_STATS, roles: ['admin'], exact: true },
        ],
      },
      { label: 'Visitas', icon: 'door', to: ROUTES.RESIDENT_EVENTS, roles: ['resident', 'concierge', 'admin'], exact: true },
      { label: 'Votaciones', icon: 'checkBadge', to: ROUTES.VOTINGS, roles: ['resident', 'admin', 'concierge', 'staff'], exact: true },
      { label: 'Áreas comunes', icon: 'sparkles', to: ROUTES.RESIDENT_AMENITIES, roles: ['resident', 'admin', 'concierge'], exact: true },
    ],
  },
  {
    title: 'Propiedad',
    roles: ['resident'],
    items: [
      { label: 'Gastos comunes', icon: 'banknotes', to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW, roles: ['resident'], exact: true },
      { label: 'Mis encomiendas', icon: 'cube', to: ROUTES.RESIDENT_PARCELS, roles: ['resident'], exact: true },
    ],
  },
  {
    title: 'Administración',
    roles: ['admin', 'concierge'],
    items: [
      { label: 'Dashboard', icon: 'chartBar', to: ROUTES.DASHBOARD, roles: ['admin', 'concierge'], exact: true },
      { label: 'Registrar Usuario', icon: 'userPlus', to: ROUTES.ADMIN_CREATE_USER, roles: ['admin'], exact: true },
      { label: 'Residentes', icon: 'users', to: ROUTES.ADMIN_RESIDENTS, roles: ['admin', 'concierge'], exact: true },
      { label: 'Unidades', icon: 'homeModern', to: ROUTES.ADMIN_HOUSING_UNITS, roles: ['admin'], exact: true },
      { label: 'Cargar gastos', icon: 'banknotes', to: ROUTES.COMMON_CHARGES, roles: ['admin'], exact: true },
    ],
  },
];