# Estructura de Rutas - Plataforma Domu

## 📍 Descripción General

Este documento describe la arquitectura de rutas de la plataforma Domu, organizada en tres categorías principales: **Rutas Públicas**, **Rutas de Administrador** y **Rutas de Residentes**.

## 🔓 Rutas Públicas (Sin Autenticación)

### Informativas
- `/` - Página principal (Home)
- `/about` - Acerca de Domu
- `/features` - Funcionalidades de la plataforma
- `/pricing` - Planes y precios
- `/contact` - Contacto

### Autenticación
- `/login` - Inicio de sesión para administradores y residentes
- `/register` - Registro de nuevas comunidades

## 🔐 Rutas Protegidas - Administrador

### Dashboard Principal
- `/dashboard` - Panel principal con resumen

### Gestión de Comunidades
- `/dashboard/communities` - Lista de comunidades
- `/dashboard/communities/:id` - Detalle de una comunidad
- `/dashboard/communities/:id/edit` - Editar comunidad

### Gestión de Residentes
- `/dashboard/residents` - Lista de residentes
- `/dashboard/residents/:id` - Perfil de residente

### Gastos Comunes
- `/dashboard/charges` - Lista de gastos comunes
- `/dashboard/charges/:id` - Detalle de gasto común
- `/dashboard/charges/new` - Crear nuevo gasto común

### Pagos
- `/dashboard/payments` - Lista de pagos
- `/dashboard/payments/:id` - Detalle de pago
- `/dashboard/payments/export` - Exportar pagos

### Comunicaciones
- `/dashboard/announcements` - Lista de anuncios
- `/dashboard/announcements/new` - Crear nuevo anuncio

### Eventos
- `/dashboard/events` - Lista de eventos
- `/dashboard/events/new` - Crear nuevo evento

### Reportes
- `/dashboard/reports` - Panel de reportes
- `/dashboard/reports/financial` - Reportes financieros
- `/dashboard/reports/occupancy` - Reportes de ocupación

### Configuración
- `/dashboard/settings` - Configuración general
- `/dashboard/settings/communities` - Configuración de comunidades
- `/dashboard/settings/payments` - Configuración de pagos

## 👤 Rutas Protegidas - Residentes

### Portal Principal
- `/resident` - Portal principal del residente

### Gastos Comunes
- `/resident/charges` - Mis gastos comunes
- `/resident/charges/:id` - Detalle de gasto común
- `/resident/charges/pay/:id` - Pago de gasto común

### Pagos
- `/resident/payments` - Historial de pagos
- `/resident/payments/:id` - Detalle de pago

### Servicios
- `/resident/services` - Servicios disponibles
- `/resident/services/parking` - Solicitud de estacionamiento
- `/resident/services/amenities` - Reserva de amenities

### Comunicaciones
- `/resident/announcements` - Avisos y comunicaciones
- `/resident/announcements/:id` - Detalle de aviso

### Eventos
- `/resident/events` - Eventos de la comunidad
- `/resident/events/:id` - Detalle de evento
- `/resident/events/register/:id` - Inscripción a evento

### Perfil y Configuración
- `/resident/profile` - Mi perfil
- `/resident/profile/edit` - Editar perfil
- `/resident/support` - Soporte técnico

## 🛡️ Protección de Rutas

### Middleware de Autenticación

Todas las rutas protegidas requerirán:
1. Token JWT válido
2. Rol de usuario apropiado (admin/resident)
3. Recurso asignado a la comunidad del usuario

### Ejemplo de implementación:

```javascript
// src/hooks/useAuth.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context';
import { requiresAuth, requiresAdmin, requiresResident } from '../constants/routes';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAppContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/resident" />;
  }

  if (requiredRole === 'resident' && user.role !== 'resident') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
```

## 🔄 Flujo de Navegación

### Login Flow
```
Usuario → /login → Autenticación → 
  - Si es Admin → /dashboard
  - Si es Resident → /resident
```

### Dashboard Flow (Admin)
```
Admin → /dashboard → Seleccionar acción →
  - Comunidades → /dashboard/communities
  - Residentes → /dashboard/residents
  - Gastos → /dashboard/charges
  - Pagos → /dashboard/payments
  - Reportes → /dashboard/reports
```

### Resident Flow
```
Resident → /resident → Seleccionar acción →
  - Gastos → /resident/charges
  - Pagos → /resident/payments
  - Servicios → /resident/services
  - Eventos → /resident/events
```

## 📱 Responsive Behavior

### Desktop (>1024px)
- Sidebar navigation visible
- Breadcrumbs en todas las rutas

### Tablet (768px - 1024px)
- Collapsible sidebar
- Breadcrumbs visibles

### Mobile (<768px)
- Hamburger menu
- Bottom navigation para residentes
- Tab navigation donde aplique

## 🔍 Búsqueda y Filtros

Rutas que implementarán búsqueda:
- `/dashboard/communities` - Buscar por nombre
- `/dashboard/residents` - Buscar por nombre o unidad
- `/dashboard/charges` - Filtrar por período
- `/resident/charges` - Filtrar por estado

## 📊 Lazy Loading

Implementar React.lazy() para optimización:

```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResidentPortal = lazy(() => import('./pages/ResidentPortal'));
const Communities = lazy(() => import('./pages/Communities'));
// etc.
```

## ✅ Próximos Pasos

1. Implementar componente ProtectedRoute
2. Crear layout específico para cada sección
3. Implementar lazy loading
4. Agregar breadcrumbs
5. Implementar búsqueda y filtros
6. Agregar animaciones de transición entre rutas





