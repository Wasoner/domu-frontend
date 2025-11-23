import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, About, Login, Register, Dashboard, ResidentPortal } from './pages'
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

          {/* Protected Routes - Admin */}
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          {/* Protected Routes - Resident */}
          <Route path={ROUTES.RESIDENT_PORTAL} element={<ResidentPortal />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
