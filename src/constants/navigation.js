import { ROUTES } from './routes';



export const NAV_SECTIONS = [

  {

    title: 'Administración',

    roles: ['admin', 'concierge'],

    items: [
      { label: 'Dashboard', icon: '📊', to: ROUTES.DASHBOARD, roles: ['admin', 'concierge'], exact: true },
      { label: 'Crear usuarios', icon: '➕', to: ROUTES.ADMIN_CREATE_USER, roles: ['admin'], exact: true },
      { label: 'Incidentes', icon: '🚨', to: ROUTES.ADMIN_INCIDENTS, roles: ['admin', 'concierge'], exact: true },
      { label: 'Comunidades', icon: '🏢', roles: ['admin'] },

      { label: 'Residentes', icon: '👥', roles: ['admin'] },

      { label: 'Gastos comunes', icon: '💳', roles: ['admin'] },

      { label: 'Pagos', icon: '💰', roles: ['admin'] },

    ],

  },

  {

    title: 'Comunidad',

    roles: ['resident', 'admin', 'concierge', 'staff'],

    items: [
      { label: 'Panel principal', icon: '🏠', to: ROUTES.RESIDENT_PORTAL, roles: ['resident'], exact: true },
      { label: 'Visitas', icon: '🧑‍🤝‍🧑', to: ROUTES.RESIDENT_EVENTS, roles: ['resident', 'concierge', 'admin'], exact: true },
      { label: 'Incidentes', icon: '🚨', to: ROUTES.RESIDENT_INCIDENTS, roles: ['resident'], exact: true },
      { label: 'Mi perfil', icon: '🙍‍♂️', to: ROUTES.RESIDENT_PROFILE, roles: ['resident'], exact: true },
    ],

  },

  {

    title: 'Herramientas',

    roles: ['resident', 'admin', 'concierge', 'staff'],

    items: [

      { label: 'Biblioteca', icon: '📚', roles: ['resident', 'concierge'] },

      { label: 'Anuncios', icon: '📣', roles: ['admin', 'concierge'] },

      { label: 'Reportes', icon: '📈', roles: ['admin'] },

    ],

  },

];


