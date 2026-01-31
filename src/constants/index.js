/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// Application Routes
export * from './routes';

// API Constants
export const API_ENDPOINTS = {
  USERS: '/users',
  POSTS: '/posts',
  AUTH: '/auth',
  COMMUNITIES: '/communities',
  RESIDENTS: '/residents',
  CHARGES: '/charges',
  PAYMENTS: '/payments',
  ANNOUNCEMENTS: '/announcements',
  EVENTS: '/events',
};

// UI Constants
export const THEME = {
  COLORS: {
    PRIMARY: '#646cff',
    SECONDARY: '#535bf2',
    SUCCESS: '#4caf50',
    ERROR: '#f44336',
    WARNING: '#ff9800',
  },
  BREAKPOINTS: {
    MOBILE: '768px',
    TABLET: '1024px',
    DESKTOP: '1280px',
  },
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Domu Frontend',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'es',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  RESIDENT: 'resident',
  MANAGER: 'manager',
};

// Charge Status
export const CHARGE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};
