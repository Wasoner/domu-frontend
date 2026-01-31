import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  Home,
  About,
  Login,
  Register,
  AdminInviteRegister,
  Dashboard,
  AdminCreateUser,
  AdminIncidentsBoard,
  AdminResidents,
  AdminHousingUnits,
  AdminCommonExpenses,
  ResidentPortal,
  ResidentVisits,
  ResidentProfile,
  ResidentIncidents,
  ResidentAmenities,
  ResidentCartola,
  ResidentChargesDetail,
  ResidentParcels,
  ResidentMeters,
  ResidentPublications,
  ResidentExpenses,
  ResidentFunds,
  ResidentLibrary,
  Votaciones,
  UserTypeConserjeria,
  UserTypeAdministrador,
  UserTypeComite,
  UserTypeResidente,
  UserTypeFuncionarios,
} from './pages'
import { AppProvider } from './context'
import { ROUTES } from './constants'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.ADMIN_INVITE} element={<AdminInviteRegister />} />

          {/* Soluciones - Landing pages por tipo de usuario */}
          <Route path={ROUTES.SOLUCIONES_CONSERJERIA} element={<UserTypeConserjeria />} />
          <Route path={ROUTES.SOLUCIONES_ADMINISTRADOR} element={<UserTypeAdministrador />} />
          <Route path={ROUTES.SOLUCIONES_COMITE} element={<UserTypeComite />} />
          <Route path={ROUTES.SOLUCIONES_RESIDENTE} element={<UserTypeResidente />} />
          <Route path={ROUTES.SOLUCIONES_FUNCIONARIOS} element={<UserTypeFuncionarios />} />

          {/* Protected Routes - Admin */}
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.ADMIN_CREATE_USER} element={<AdminCreateUser />} />
          <Route path={ROUTES.ADMIN_INCIDENTS} element={<AdminIncidentsBoard />} />
          <Route path={ROUTES.ADMIN_RESIDENTS} element={<AdminResidents />} />
          <Route path={ROUTES.ADMIN_HOUSING_UNITS} element={<AdminHousingUnits />} />
          <Route path={ROUTES.COMMON_CHARGES} element={<AdminCommonExpenses />} />

          {/* Protected Routes - Resident */}
          <Route path={ROUTES.RESIDENT_PORTAL} element={<ResidentPortal />} />
          <Route path={ROUTES.RESIDENT_EVENTS} element={<ResidentVisits />} />
          <Route path={ROUTES.RESIDENT_PROFILE} element={<ResidentProfile />} />
          <Route path={ROUTES.RESIDENT_INCIDENTS} element={<ResidentIncidents />} />
          <Route path={ROUTES.RESIDENT_AMENITIES} element={<ResidentAmenities />} />
          <Route path={ROUTES.VOTINGS} element={<Votaciones />} />

          {/* Propiedad - Resident */}
          <Route path={ROUTES.RESIDENT_CARTOLA} element={<ResidentCartola />} />
          <Route path={ROUTES.RESIDENT_CHARGES_DETAIL_VIEW} element={<ResidentChargesDetail />} />
          <Route path={ROUTES.RESIDENT_PARCELS} element={<ResidentParcels />} />
          <Route path={ROUTES.RESIDENT_METERS} element={<ResidentMeters />} />

          {/* Comunidad - Resident */}
          <Route path={ROUTES.RESIDENT_PUBLICATIONS} element={<ResidentPublications />} />
          <Route path={ROUTES.RESIDENT_EXPENSES} element={<ResidentExpenses />} />
          <Route path={ROUTES.RESIDENT_FUNDS} element={<ResidentFunds />} />
          <Route path={ROUTES.RESIDENT_LIBRARY} element={<ResidentLibrary />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
