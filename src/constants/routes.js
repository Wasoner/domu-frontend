/**
 * Application Routes Constants
 * Centralized route definitions for better maintainability
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_INVITE: '/registrar-admin',
  FEATURES: '/features',
  PRICING: '/pricing',
  CONTACT: '/contact',

  // Protected routes - Admin
  DASHBOARD: '/dashboard',
  ADMIN_CREATE_USER: '/dashboard/users/create',
  COMMUNITIES: '/dashboard/communities',
  COMMUNITY_DETAIL: '/dashboard/communities/:id',
  RESIDENTS: '/dashboard/residents',
  COMMON_CHARGES: '/dashboard/charges',
  CHARGES_DETAIL: '/dashboard/charges/:id',
  PAYMENTS: '/dashboard/payments',
  ANNOUNCEMENTS: '/dashboard/announcements',
  EVENTS: '/dashboard/events',
  REPORTS: '/dashboard/reports',
  SETTINGS: '/dashboard/settings',

  // Protected routes - Resident
  RESIDENT_PORTAL: '/resident',
  RESIDENT_CHARGES: '/resident/charges',
  RESIDENT_CHARGES_DETAIL: '/resident/charges/:id',
  RESIDENT_PAYMENTS: '/resident/payments',
  RESIDENT_HISTORY: '/resident/history',
  RESIDENT_ANNOUNCEMENTS: '/resident/announcements',
  RESIDENT_EVENTS: '/resident/events',
  RESIDENT_SERVICES: '/resident/services',
  RESIDENT_PROFILE: '/resident/profile',
  RESIDENT_SUPPORT: '/resident/support',
  RESIDENT_INCIDENTS: '/resident/incidents',
};

/**
 * Route categories for navigation and access control
 */
export const ROUTE_CATEGORIES = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.ABOUT,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.ADMIN_INVITE,
    ROUTES.FEATURES,
    ROUTES.PRICING,
    ROUTES.CONTACT,
  ],
  ADMIN: [
    ROUTES.DASHBOARD,
    ROUTES.COMMUNITIES,
    ROUTES.RESIDENTS,
    ROUTES.COMMON_CHARGES,
    ROUTES.PAYMENTS,
    ROUTES.ANNOUNCEMENTS,
    ROUTES.EVENTS,
    ROUTES.REPORTS,
    ROUTES.SETTINGS,
  ],
  RESIDENT: [
    ROUTES.RESIDENT_PORTAL,
    ROUTES.RESIDENT_CHARGES,
    ROUTES.RESIDENT_PAYMENTS,
    ROUTES.RESIDENT_HISTORY,
    ROUTES.RESIDENT_ANNOUNCEMENTS,
    ROUTES.RESIDENT_EVENTS,
    ROUTES.RESIDENT_SERVICES,
    ROUTES.RESIDENT_PROFILE,
    ROUTES.RESIDENT_SUPPORT,
  ],
};

/**
 * Helper function to generate dynamic routes
 */
export const createDynamicRoute = (routePattern, params) => {
  let route = routePattern;
  Object.keys(params).forEach((key) => {
    route = route.replace(`:${key}`, params[key]);
  });
  return route;
};

/**
 * Helper function to check if route requires authentication
 */
export const requiresAuth = (pathname) => {
  const allProtectedRoutes = [...ROUTE_CATEGORIES.ADMIN, ...ROUTE_CATEGORIES.RESIDENT];
  return allProtectedRoutes.some((route) => pathname.startsWith(route));
};

/**
 * Helper function to check if route is admin-only
 */
export const requiresAdmin = (pathname) => {
  return ROUTE_CATEGORIES.ADMIN.some((route) => pathname.startsWith(route));
};

/**
 * Helper function to check if route is resident-only
 */
export const requiresResident = (pathname) => {
  return ROUTE_CATEGORIES.RESIDENT.some((route) => pathname.startsWith(route));
};





