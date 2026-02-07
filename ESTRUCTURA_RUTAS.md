# Estructura de Rutas - Plataforma Domu

## 📍 Descripción General

Este documento describe la arquitectura de rutas de la plataforma Domu, organizada en cuatro categorías principales: **Rutas Públicas**, **Rutas de Soluciones**, **Rutas de Administrador** y **Rutas de Residentes**.

## 🔓 Rutas Públicas (Sin Autenticación)

### Informativas
- `/` - Página principal (Home)
- `/about` - Acerca de Domu
- `/register` - Registro
- `/login` - Inicio de sesión
- `/registrar-admin` - Invitación para registro de administradores

## 🚀 Rutas de Soluciones (Landing Pages)

Páginas informativas específicas por tipo de usuario:
- `/soluciones/conserjeria` - Soluciones para Conserjería
- `/soluciones/administrador` - Soluciones para Administradores
- `/soluciones/comite` - Soluciones para Comité
- `/soluciones/residente` - Soluciones para Residentes
- `/soluciones/funcionarios` - Soluciones para Funcionarios

## 🔐 Rutas Protegidas - Administrador

Estas rutas requieren autenticación y rol de administrador.

### Dashboard y Gestión
- `/dashboard` - Panel principal
- `/dashboard/users/create` - Crear nuevo usuario
- `/dashboard/residents` - Gestión de residentes
- `/dashboard/unidades` - Gestión de unidades habitacionales
- `/dashboard/charges` - Gestión de gastos comunes
- `/dashboard/incidents` - Tablero de incidentes

### Planificadas / En Desarrollo
- `/dashboard/communities` - Gestión de comunidades
- `/dashboard/payments` - Gestión de pagos
- `/dashboard/announcements` - Anuncios
- `/dashboard/events` - Eventos
- `/dashboard/reports` - Reportes
- `/dashboard/settings` - Configuración

## 👤 Rutas Protegidas - Residentes

Estas rutas requieren autenticación y rol de residente.

### Portal y Perfil
- `/resident` - Portal principal del residente
- `/resident/profile` - Perfil de usuario

### Gestión Financiera
- `/resident/gasto-comun` - Detalle de gastos comunes
- `/resident/cartola` - Cartola de movimientos
- `/resident/egresos` - Visualización de egresos
- `/resident/fondos` - Estado de fondos

### Comunidad y Servicios
- `/resident/events` - Registro de visitas
- `/resident/incidents` - Reporte de incidentes
- `/resident/amenities` - Reserva de áreas comunes
- `/votaciones` - Votaciones y encuestas
- `/resident/publicaciones` - Publicaciones de la comunidad
- `/resident/biblioteca` - Biblioteca de documentos

### Propiedad
- `/resident/encomiendas` - Gestión de encomiendas
- `/resident/medidores` - Lectura de medidores

## 🛡️ Protección de Rutas

### Middleware de Autenticación

Las rutas están protegidas mediante validación de sesión en `App.jsx` y constantes definidas en `src/constants/routes.js`.

### Categorías de Rutas (`src/constants/routes.js`)

```javascript
export const ROUTE_CATEGORIES = {
  PUBLIC: [ ... ],   // Accesibles para todos
  ADMIN: [ ... ],    // Requieren rol de administrador
  RESIDENT: [ ... ]  // Requieren rol de residente
};
```

## 🔄 Flujo de Navegación

### Login Flow
```
Usuario → /login → Autenticación → 
  - Si es Admin → /dashboard
  - Si es Resident → /resident
```

### Admin Dashboard Flow
```
Admin → /dashboard →
  - Usuarios → /dashboard/users/create
  - Residentes → /dashboard/residents
  - Unidades → /dashboard/unidades
  - Incidentes → /dashboard/incidents
```

### Resident Portal Flow
```
Resident → /resident →
  - Finanzas → /resident/gasto-comun, /resident/cartola
  - Comunidad → /resident/events (Visitas), /votaciones
  - Servicios → /resident/amenities
```