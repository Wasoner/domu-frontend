import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '.';
import { useAppContext } from '../context';
import { ROUTES } from '../constants';
import { NAV_SECTIONS } from '../constants/navigation';

const filterSectionsByRole = (sections, role) => {
  return sections
    .filter((section) => !section.roles || section.roles.includes(role))
    .map((section) => {
      const items = (section.items || []).filter((item) => !item.roles || item.roles.includes(role));
      return { ...section, items };
    })
    .filter((section) => section.items && section.items.length > 0);
};

const ProtectedLayout = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAppContext();
  const userRole = user?.userType;

  const navSections = useMemo(() => filterSectionsByRole(NAV_SECTIONS, userRole), [userRole]);

  if (isLoading) {
    return (
      <div className="auth-layout__loading">
        <p>Cargando tu sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const fallback = userRole === 'admin' ? ROUTES.DASHBOARD : ROUTES.RESIDENT_PORTAL;
    return <Navigate to={fallback} replace />;
  }

  return (
    <AuthLayout user={user} navSections={navSections}>
      {children}
    </AuthLayout>
  );
};

ProtectedLayout.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

ProtectedLayout.defaultProps = {
  allowedRoles: null,
};

export default ProtectedLayout;
