# Arquitectura Frontend DOMU

## 1) Objetivo del documento
Este documento describe la estructura real de `domu-frontend` desde una perspectiva de ingenieria de software:
- Responsabilidad de cada carpeta.
- Responsabilidad de cada archivo.
- Dependencias clave entre modulos.
- Estado del archivo: `operativo`, `soporte`, `mock`, `legacy`, `generado`.

## 2) Flujo de ejecucion de la app
1. `index.html` monta `#root` y carga `src/main.jsx`.
2. `src/main.jsx` inicializa React y renderiza `src/App.jsx`.
3. `src/App.jsx` declara rutas con `react-router-dom` y envuelve con `AppProvider`.
4. Cada pagina protegida usa `ProtectedLayout` (auth, rol y layout autenticado).
5. Las paginas consumen `api` (`src/services/api.js`) y estado global (`src/context`).

## 3) Estructura de alto nivel
- `src/`: codigo fuente de la aplicacion.
- `public/`: assets publicos no procesados por bundler.
- `dev-dist/`: artefactos PWA en desarrollo (generado).
- `dist/`: build de produccion (generado).
- `node_modules/`: dependencias instaladas (generado).

## 4) Raiz del proyecto (`domu-frontend/`)

| Archivo/Carpeta | Rol tecnico | Estado |
|---|---|---|
| `package.json` | Scripts (`dev/build/lint/preview`) y dependencias del runtime/build. | operativo |
| `package-lock.json` | Lockfile para builds reproducibles. | operativo |
| `vite.config.js` | Configuracion Vite, proxy `/api`, plugin PWA. | operativo |
| `eslint.config.js` | Reglas de calidad estatica para JS/JSX. | operativo |
| `index.html` | Documento HTML base, meta SEO inicial, `manifest`, `#root`. | operativo |
| `.gitignore` | Politica de archivos excluidos de Git. | soporte |
| `README.md` | Guia general de proyecto y setup. | soporte |
| `STRUCTURE.md` | Guia de estructura (documentacion interna). | soporte |
| `ESTRUCTURA_RUTAS.md` | Mapa funcional de rutas por dominio/rol. | soporte |
| `PLAN_PLATAFORMA.md` | Plan de desarrollo. | soporte |
| `BUENAS_PRACTICAS.md` | Convenciones y practicas de equipo. | soporte |
| `AGENTS.md` | Instrucciones operativas para agentes. | soporte |
| `public/` | Assets publicos de app/PWA. | operativo |
| `src/` | Codigo fuente principal. | operativo |
| `dev-dist/` | Service worker y runtime en desarrollo. | generado |
| `dist/` | Bundle final de produccion. | generado |
| `node_modules/` | Paquetes npm instalados. | generado |

## 5) `public/`

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `public/favicon.svg` | Icono principal de la app. | operativo |
| `public/manifest.json` | Manifest PWA principal (nombre, colores, iconos, start_url). | operativo |
| `public/site.webmanifest` | Variante de manifest web. | operativo |

## 6) `dev-dist/` (artefactos generados PWA)

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `dev-dist/registerSW.js` | Registro de Service Worker en modo dev. | generado |
| `dev-dist/sw.js` | Service Worker generado por plugin PWA. | generado |
| `dev-dist/workbox-5a5d9309.js` | Runtime Workbox para cache/offline. | generado |

## 7) `src/` - modulo por modulo

### 7.1 Entrypoints y globales

| Archivo | Responsabilidad | Dependencias clave | Estado |
|---|---|---|---|
| `src/main.jsx` | Bootstrap React (`createRoot`, `StrictMode`) y estilos globales. | `react`, `react-dom`, `styles/index.scss`, `App.jsx` | operativo |
| `src/App.jsx` | Router central y composicion global (`AppProvider`). | `react-router-dom`, `pages`, `constants/routes` | operativo |
| `src/styles/index.scss` | Tokens, base visual y estilos globales. | N/A | operativo |
| `src/assets/LogotipoDOMU.svg` | Activo de marca en layout autenticado. | `layout/AuthHeader.jsx` | operativo |

### 7.2 `src/constants/`

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/constants/index.js` | Barrel y constantes compartidas (API_ENDPOINTS, THEME, roles, estados). | operativo |
| `src/constants/routes.js` | Contrato de rutas y helpers de autorizacion por categoria. | operativo |
| `src/constants/navigation.js` | Definicion de menu lateral por seccion/rol. | operativo |
| `src/constants/notifications.js` | Catalogos visuales de notificaciones/incidentes + mock notifications. | operativo |

### 7.3 `src/context/`

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/context/appContextDefinition.js` | Creacion del contexto (`AppContext`). | operativo |
| `src/context/AppContext.jsx` | Provider global: sesion, usuario, edificio activo, tema, loading, logout. | operativo |
| `src/context/useAppContext.js` | Hook de consumo seguro del contexto. | operativo |
| `src/context/index.js` | Barrel de exports del contexto. | operativo |

### 7.4 `src/hooks/`

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/hooks/useCountdown.js` | Hook de cuenta regresiva reutilizable (timer y callbacks). | operativo |
| `src/hooks/useNotifications.js` | Estado de notificaciones por usuario usando `localStorage`. | operativo |

### 7.5 `src/services/`

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/services/index.js` | Barrel de servicios (`api`, `communityMaps`). | operativo |
| `src/services/communityMaps.js` | Registro local de comunidades georreferenciadas y estadisticas. | operativo |
| `src/services/api.js` | Cliente HTTP base y modulos de dominio (`auth`, `finance`, `visits`, `incidents`, etc.). | operativo |

#### Modulos expuestos por `api.js`
- `auth`
- `finance`
- `tasks`
- `buildings`
- `visits`
- `incidents`
- `parcels`
- `adminInvites`
- `adminUsers`
- `adminStaff`
- `staff`
- `users`
- `library`
- `amenities`
- `reservations`
- `polls`
- `housingUnits`
- `market`
- `forum`
- `chat`

### 7.6 `src/layout/`

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/layout/index.js` | Barrel de layouts. | operativo |
| `src/layout/Header.jsx` | Header publico (home/about/soluciones/login). | operativo |
| `src/layout/Header.scss` | Estilos de `Header.jsx`. | operativo |
| `src/layout/Footer.jsx` | Footer publico. | operativo |
| `src/layout/Footer.scss` | Estilos de `Footer.jsx`. | operativo |
| `src/layout/MainContent.jsx` | Contenedor principal con variante `fullWidth`. | operativo |
| `src/layout/MainContent.scss` | Estilos de `MainContent.jsx`. | operativo |
| `src/layout/AuthHeader.jsx` | Header autenticado (edificio activo, ayuda, notificaciones). | operativo |
| `src/layout/AuthHeader.scss` | Estilos de `AuthHeader.jsx`. | operativo |
| `src/layout/Sidebar.jsx` | Navegacion lateral por rol, submenus, perfil y logout. | operativo |
| `src/layout/Sidebar.scss` | Estilos de `Sidebar.jsx`. | operativo |
| `src/layout/AuthLayout.jsx` | Shell autenticado: `AuthHeader + Sidebar + content`. | operativo |
| `src/layout/AuthLayout.scss` | Estilos de `AuthLayout.jsx`. | operativo |
| `src/layout/ProtectedLayout.jsx` | Guard de auth/rol y montaje de layout protegido. | operativo |

### 7.7 `src/components/` (reutilizables)

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/components/index.js` | Barrel de componentes compartidos. | operativo |
| `src/components/Button.jsx` | Boton reutilizable con variantes, tamano y loading. | operativo |
| `src/components/Button.scss` | Estilos de `Button.jsx`. | operativo |
| `src/components/FormField.jsx` | Campo de formulario accesible con hint/error. | operativo |
| `src/components/FormField.scss` | Estilos de `FormField.jsx`. | operativo |
| `src/components/Icon.jsx` | Sistema central de iconos SVG. | operativo |
| `src/components/Seo.jsx` | Gestion de title/meta/canonical/JSON-LD por vista. | operativo |
| `src/components/Skeleton.jsx` | Placeholders de carga y presets (`List`, `Cards`, `Form`, `Stats`, etc.). | operativo |
| `src/components/Skeleton.scss` | Estilos de skeletons. | operativo |
| `src/components/Spinner.jsx` | Indicador de carga configurable. | operativo |
| `src/components/Spinner.scss` | Estilos de spinner. | operativo |
| `src/components/ProtectedRoute.jsx` | Guard legacy de rutas por auth (hoy predomina `ProtectedLayout`). | legacy |
| `src/components/ConfirmModal.jsx` | Modal de confirmacion reutilizable. | operativo |
| `src/components/ConfirmModal.scss` | Estilos de `ConfirmModal.jsx`. | operativo |
| `src/components/CreatePublicationModal.jsx` | Modal de crear/editar publicaciones. | operativo |
| `src/components/CreatePublicationModal.scss` | Estilos de `CreatePublicationModal.jsx`. | operativo |
| `src/components/MarketCard.jsx` | Tarjeta individual de item marketplace. | operativo |
| `src/components/MarketCard.scss` | Estilos de `MarketCard.jsx`. | operativo |
| `src/components/MarketCarousel.jsx` | Carrusel de marketplace para portada/portal. | operativo |
| `src/components/MarketCarousel.scss` | Estilos de `MarketCarousel.jsx`. | operativo |
| `src/components/NeighborProfileModal.jsx` | Perfil de vecino y solicitud de chat. | operativo |
| `src/components/NeighborProfileModal.scss` | Estilos de `NeighborProfileModal.jsx`. | operativo |
| `src/components/LocationPicker.jsx` | Selector de ubicacion (mapa, geocoding, sugerencias). | operativo |
| `src/components/VisitRegistrationPanel.jsx` | Modulo integral de visitas (registro, QR, historial, contactos). | operativo |
| `src/components/VisitPanel.scss` | Estilos de `VisitRegistrationPanel.jsx`. | operativo |

### 7.8 `src/components/payment/` (subdominio pagos)

| Archivo | Responsabilidad | Estado |
|---|---|---|
| `src/components/payment/index.js` | Barrel de componentes de pago. | operativo |
| `src/components/payment/ChargeSelector.jsx` | Seleccion de cargos y montos parciales con validacion. | operativo |
| `src/components/payment/ChargeSelector.scss` | Estilos de `ChargeSelector.jsx`. | operativo |
| `src/components/payment/PaymentMethodModal.jsx` | Seleccion de metodo de pago. | operativo |
| `src/components/payment/PaymentMethodModal.scss` | Estilos de `PaymentMethodModal.jsx`. | operativo |
| `src/components/payment/BankTransferView.jsx` | Flujo de transferencia: datos bancarios, copiado y countdown. | operativo |
| `src/components/payment/BankTransferView.scss` | Estilos de `BankTransferView.jsx`. | operativo |
| `src/components/payment/CardPaymentView.jsx` | Flujo de pago con tarjeta y validaciones UI. | operativo |
| `src/components/payment/CardPaymentView.scss` | Estilos de `CardPaymentView.jsx`. | operativo |
| `src/components/payment/CreditCardSVG.jsx` | Visual dinamica de tarjeta (front/back). | operativo |
| `src/components/payment/CreditCardSVG.scss` | Estilos de `CreditCardSVG.jsx`. | operativo |
| `src/components/payment/PaymentSuccess.jsx` | Confirmacion visual de pago y redireccion. | operativo |
| `src/components/payment/PaymentSuccess.scss` | Estilos de `PaymentSuccess.jsx`. | operativo |

### 7.9 `src/pages/` (componentes de ruta)

#### Publicas / comerciales / autenticacion

| Archivo | Responsabilidad | Dependencias clave | Estado |
|---|---|---|---|
| `src/pages/index.js` | Barrel central de paginas. | N/A | operativo |
| `src/pages/Home.jsx` | Landing principal y entrada contextual (publico/autenticado). | `layout`, `components`, `api`, `communityMaps`, `context` | operativo |
| `src/pages/Home.scss` | Estilos de `Home.jsx`. | N/A | operativo |
| `src/pages/About.jsx` | Pagina institucional "Acerca de". | `layout`, `Seo`, `ROUTES` | operativo |
| `src/pages/About.scss` | Estilos de `About.jsx`. | N/A | operativo |
| `src/pages/Login.jsx` | Inicio de sesion y redireccion por rol. | `api.auth.login`, `context`, `ROUTES` | operativo |
| `src/pages/Login.scss` | Estilos de `Login.jsx`. | N/A | operativo |
| `src/pages/Register.jsx` | Registro de usuarios. | `api.auth.register`, `context`, `ROUTES` | operativo |
| `src/pages/Register.scss` | Estilos de `Register.jsx`. | N/A | operativo |
| `src/pages/UserConfirmation.jsx` | Confirmacion de cuenta por token (`/auth/confirm`). | `api.post`, `ROUTES`, `Seo` | operativo |
| `src/pages/UserConfirmation.scss` | Estilos de `UserConfirmation.jsx`. | N/A | operativo |
| `src/pages/AdminInviteRegister.jsx` | Registro de admin con codigo de invitacion. | `api.adminInvites.*`, `ROUTES` | operativo |
| `src/pages/AdminInviteRegister.scss` | Estilos de `AdminInviteRegister.jsx`. | N/A | operativo |
| `src/pages/UserTypeConserjeria.jsx` | Landing comercial para conserjeria. | `layout`, `Seo`, `ROUTES` | operativo |
| `src/pages/UserTypeAdministrador.jsx` | Landing comercial para administradores. | `layout`, `Seo`, `ROUTES` | operativo |
| `src/pages/UserTypeComite.jsx` | Landing comercial para comites. | `layout`, `Seo`, `ROUTES` | operativo |
| `src/pages/UserTypeResidente.jsx` | Landing comercial para residentes. | `layout`, `Seo`, `ROUTES` | operativo |
| `src/pages/UserTypeFuncionarios.jsx` | Landing comercial para funcionarios. | `layout`, `Seo`, `ROUTES` | operativo |
| `src/pages/UserTypeLanding.scss` | Estilos compartidos de las 5 landings de soluciones. | N/A | operativo |

#### Administracion / operacion interna

| Archivo | Responsabilidad | Dependencias API | Estado |
|---|---|---|---|
| `src/pages/Dashboard.jsx` | Panel administrativo consolidado (kpis, actividad, resumen). | `adminUsers`, `finance`, `incidents`, `market` | operativo |
| `src/pages/Dashboard.scss` | Estilos de `Dashboard.jsx`. | N/A | operativo |
| `src/pages/AdminCreateUser.jsx` | Alta de usuarios administrativos/residentes. | `adminUsers.create` | operativo |
| `src/pages/AdminCreateUser.scss` | Estilos de `AdminCreateUser.jsx`. | N/A | operativo |
| `src/pages/AdminResidents.jsx` | Gestion de residentes y navegacion a detalles operativos. | `adminUsers.getResidents` | operativo |
| `src/pages/AdminResidents.scss` | Estilos activos de `AdminResidents.jsx`. | N/A | operativo |
| `src/pages/AdminResidents.css` | Variante CSS antigua de residentes. | N/A | legacy |
| `src/pages/AdminHousingUnits.jsx` | CRUD de unidades y relacion unidad-residente. | `housingUnits.*`, `adminUsers.getResidents` | operativo |
| `src/pages/AdminHousingUnits.scss` | Estilos activos de `AdminHousingUnits.jsx`. | N/A | operativo |
| `src/pages/AdminHousingUnits.css` | Variante CSS antigua de unidades. | N/A | legacy |
| `src/pages/AdminAmenities.jsx` | Gestion de amenities y configuracion de horarios/reservas. | `amenities.*`, `reservations.cancel` | operativo |
| `src/pages/AdminAmenities.scss` | Estilos de `AdminAmenities.jsx`. | N/A | operativo |
| `src/pages/AdminCommonExpenses.jsx` | Carga y gestion de gastos comunes por periodo. | `finance.*` | operativo |
| `src/pages/AdminCommonExpenses.scss` | Estilos de `AdminCommonExpenses.jsx`. | N/A | operativo |
| `src/pages/AdminParcels.jsx` | Backoffice de encomiendas. | `parcels.*`, `housingUnits.list` | operativo |
| `src/pages/AdminParcels.scss` | Estilos de `AdminParcels.jsx`. | N/A | operativo |
| `src/pages/AdminIncidentsBoard.jsx` | Tablero operativo de incidentes y asignaciones. | `incidents.*`, `adminUsers.getResidents` | operativo |
| `src/pages/AdminIncidentsBoard.scss` | Estilos de `AdminIncidentsBoard.jsx`. | N/A | operativo |
| `src/pages/AdminIncidentStats.jsx` | Visualizacion estadistica de incidentes. | `incidents.listMine` | operativo |
| `src/pages/AdminIncidentStats.scss` | Estilos de `AdminIncidentStats.jsx`. | N/A | operativo |
| `src/pages/AdminTasks.jsx` | Gestion de tareas para personal. | `tasks.*`, `adminStaff.list*` | operativo |
| `src/pages/AdminTasks.scss` | Estilos de `AdminTasks.jsx`. | N/A | operativo |
| `src/pages/AdminStaff.jsx` | Gestion integral de personal (alta/edicion/baja logica). | `adminStaff.*` | operativo |
| `src/pages/AdminStaff.scss` | Estilos de `AdminStaff.jsx`. | N/A | operativo |

#### Residente / comunidad / propiedad

| Archivo | Responsabilidad | Dependencias API | Estado |
|---|---|---|---|
| `src/pages/StaffPortal.jsx` | Portal principal autenticado (resident/staff) con widgets y modulos. | `staff.getMine`, `tasks.list`, `forum.list`, `finance.listMyPeriods` | operativo |
| `src/pages/StaffPortal.scss` | Estilos de `StaffPortal.jsx`. | N/A | operativo |
| `src/pages/StaffTasks.jsx` | Vista de tareas del staff/conserjeria. | `staff.getMine`, `tasks.list`, `tasks.update` | operativo |
| `src/pages/StaffTasks.scss` | Estilos de `StaffTasks.jsx`. | N/A | operativo |
| `src/pages/ResidentVisits.jsx` | Pantalla contenedora del modulo de visitas. | `VisitRegistrationPanel`, `context` | operativo |
| `src/pages/ResidentVisits.scss` | Estilos de `ResidentVisits.jsx`. | N/A | operativo |
| `src/pages/ResidentProfile.jsx` | Perfil de usuario, password, avatar y privacidad. | `auth.getCurrentUser`, `users.*` | operativo |
| `src/pages/ResidentProfile.scss` | Estilos de `ResidentProfile.jsx`. | N/A | operativo |
| `src/pages/ResidentIncidents.jsx` | Creacion y seguimiento de incidentes por residente. | `incidents.create`, `incidents.listMine` | operativo |
| `src/pages/ResidentIncidents.scss` | Estilos de `ResidentIncidents.jsx`. | N/A | operativo |
| `src/pages/ResidentAmenities.jsx` | Reserva y cancelacion de amenities. | `amenities.*`, `reservations.*` | operativo |
| `src/pages/ResidentAmenities.scss` | Estilos de `ResidentAmenities.jsx`. | N/A | operativo |
| `src/pages/Votaciones.jsx` | Creacion, voto y cierre/export de votaciones. | `polls.*` | operativo |
| `src/pages/Votaciones.scss` | Estilos de `Votaciones.jsx`. | N/A | operativo |
| `src/pages/ResidentPublications.jsx` | Foro/publicaciones de comunidad (CRUD). | `forum.*` | operativo |
| `src/pages/ResidentPublications.scss` | Estilos de `ResidentPublications.jsx`. | N/A | operativo |
| `src/pages/ResidentLibrary.jsx` | Biblioteca documental (listar/subir/eliminar). | `library.*` | operativo |
| `src/pages/ResidentLibrary.scss` | Estilos de `ResidentLibrary.jsx`. | N/A | operativo |
| `src/pages/ChatHub.jsx` | Mensajeria comunitaria y solicitudes de conversacion. | `chat.*` | operativo |
| `src/pages/ChatHub.scss` | Estilos de `ChatHub.jsx`. | N/A | operativo |
| `src/pages/ResidentMarketplace.jsx` | Marketplace comunitario (listado y gestion de publicaciones propias). | `market.listItems`, `market.deleteItem` | operativo |
| `src/pages/ResidentMarketplace.scss` | Estilos de `ResidentMarketplace.jsx`. | N/A | operativo |
| `src/pages/ResidentMarketplaceCreate.jsx` | Crear/editar publicacion de marketplace. | `market.createItem`, `market.getItem`, `market.updateItem` | operativo |
| `src/pages/ResidentMarketplaceCreate.scss` | Estilos de `ResidentMarketplaceCreate.jsx`. | N/A | operativo |
| `src/pages/ResidentChargesDetail.jsx` | Detalle de cobros por periodo y descargas de comprobantes/PDF. | `finance.listMyPeriods`, `finance.getMyPeriodDetail`, `finance.download*` | operativo |
| `src/pages/ResidentChargesDetail.scss` | Estilos de `ResidentChargesDetail.jsx`. | N/A | operativo |
| `src/pages/ResidentPaymentFlow.jsx` | Flujo de pago de gastos comunes. | `finance.getMyCharges`, `finance.paySimulated` | operativo |
| `src/pages/ResidentPaymentFlow.scss` | Estilos de `ResidentPaymentFlow.jsx`. | N/A | operativo |
| `src/pages/ResidentCartola.jsx` | Vista resumida de movimientos/cargos del residente. | `finance.getMyCharges` | operativo |
| `src/pages/ResidentCartola.scss` | Estilos de `ResidentCartola.jsx`. | N/A | operativo |
| `src/pages/ResidentParcels.jsx` | Consulta de encomiendas del residente. | `parcels.listMine`, `users.getMyUnit` | operativo |
| `src/pages/ResidentParcels.scss` | Estilos de `ResidentParcels.jsx`. | N/A | operativo |
| `src/pages/ResidentExpenses.jsx` | Vista de egresos comunitarios con datos mock. | N/A | mock |
| `src/pages/ResidentExpenses.scss` | Estilos de `ResidentExpenses.jsx`. | N/A | operativo |
| `src/pages/ResidentFunds.jsx` | Vista de fondos comunitarios con datos mock. | N/A | mock |
| `src/pages/ResidentFunds.scss` | Estilos de `ResidentFunds.jsx`. | N/A | operativo |
| `src/pages/ResidentMeters.jsx` | Vista de medidores con modal de registro (mock + TODO API). | N/A | mock |
| `src/pages/ResidentMeters.scss` | Estilos de `ResidentMeters.jsx`. | N/A | operativo |

## 8) Dependencias cruzadas (arquitectura real)
- `pages` dependen de `layout`, `components`, `services`, `context`, `constants`.
- `layout/ProtectedLayout` centraliza autorizacion y estructura protegida.
- `services/api.js` centraliza acceso backend y manejo de token/headers.
- `context/AppContext.jsx` sincroniza estado de sesion y edificio activo.
- `constants/routes.js` es el contrato de rutas usado por router y navegacion.

## 9) Riesgos tecnicos observados
- Existen archivos legacy CSS (`AdminResidents.css`, `AdminHousingUnits.css`) junto a SCSS activos.
- `ProtectedRoute.jsx` permanece en repositorio, pero la estrategia principal actual es `ProtectedLayout`.
- Algunas paginas productivas de residente usan datos mock (`Expenses`, `Funds`, `Meters`).

## 10) Recomendacion de mantenimiento
1. Eliminar o archivar archivos legacy no referenciados para reducir deuda tecnica.
2. Estandarizar la proteccion de rutas en un solo mecanismo (`ProtectedLayout`).
3. Etiquetar explicitamente en UI las vistas mock para evitar confusiones en QA/UAT.
4. Mantener este documento alineado cuando se agreguen nuevas rutas o modulos API.

