import { ROUTES } from './routes';



export const NAV_SECTIONS = [

  {
    title: 'Inicio',
    roles: ['resident', 'staff'],
    items: [
      { label: 'Panel principal', icon: 'home', to: ROUTES.RESIDENT_PORTAL, roles: ['resident', 'staff'], exact: true },
    ],
  },
  {
    title: 'Administración',

    roles: ['admin', 'concierge'],

    items: [
      { label: 'Dashboard', icon: 'chartBar', to: ROUTES.DASHBOARD, roles: ['admin', 'concierge'], exact: true },
      { label: 'Crear usuarios', icon: 'user', to: ROUTES.ADMIN_CREATE_USER, roles: ['admin'], exact: true },
      { label: 'Incidentes', icon: 'ticket', to: ROUTES.ADMIN_INCIDENTS, roles: ['admin', 'concierge'], exact: true },
      { label: 'Comunidades', icon: 'buildingOffice', roles: ['admin'] },

      { label: 'Residentes', icon: 'users', to: ROUTES.ADMIN_RESIDENTS, roles: ['admin', 'concierge'], exact: true },
      { label: 'Unidades', icon: 'homeModern', to: ROUTES.ADMIN_HOUSING_UNITS, roles: ['admin'], exact: true },

      { label: 'Gastos comunes', icon: 'banknotes', to: ROUTES.COMMON_CHARGES, roles: ['admin'], exact: true },

      { label: 'Pagos', icon: 'currencyDollar', roles: ['admin'] },

    ],

  },

  {

    title: 'Comunidad',

    roles: ['resident', 'admin', 'concierge', 'staff'],

    items: [
      { label: 'Visitas', icon: 'door', to: ROUTES.RESIDENT_EVENTS, roles: ['resident', 'concierge', 'admin'], exact: true },
      { label: 'Incidentes', icon: 'exclamationTriangle', to: ROUTES.RESIDENT_INCIDENTS, roles: ['resident'], exact: true },
      { label: 'Votaciones', icon: 'checkBadge', to: ROUTES.VOTINGS, roles: ['resident', 'admin', 'concierge', 'staff'], exact: true },
      { label: 'Áreas comunes', icon: 'sparkles', to: ROUTES.RESIDENT_AMENITIES, roles: ['resident', 'admin', 'concierge'], exact: true },
      { label: 'Gastos comunes', icon: 'banknotes', to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW, roles: ['resident'], exact: true },
      { label: 'Mi perfil', icon: 'userCircle', to: ROUTES.RESIDENT_PROFILE, roles: ['resident'], exact: true },
    ],

  },
  {

    title: 'Propiedad',

    roles: ['resident'],

    items: [
      { label: 'Gastos comunes', icon: 'banknotes', to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW, roles: ['resident'], exact: true },
    ],

  },
  {

    title: 'Propiedad',

    roles: ['resident'],

    items: [
      { label: 'Gastos comunes', icon: '💳', to: ROUTES.RESIDENT_CHARGES_DETAIL_VIEW, roles: ['resident'], exact: true },
    ],

  },

  {

    title: 'Herramientas',

    roles: ['resident', 'admin', 'concierge', 'staff'],

    items: [

      { label: 'Biblioteca', icon: 'folder', roles: ['resident', 'concierge'] },

      { label: 'Anuncios', icon: 'bellAlert', roles: ['admin', 'concierge'] },

      { label: 'Reportes', icon: 'chartBar', roles: ['admin'] },

    ],

  },

];
