import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { Spinner } from './Spinner';
import { ROUTES } from '../constants';

/**
 * ProtectedRoute - Componente que protege rutas autenticadas.
 * Si el usuario no está autenticado, redirige al login.
 * Mientras se verifica la autenticación, muestra un spinner.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppContext();

  // Mientras se verifica la autenticación, mostrar spinner
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;
