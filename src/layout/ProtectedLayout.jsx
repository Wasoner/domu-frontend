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
      const items = (section.items || [])
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => {
          if (item.subItems) {
            const subItems = item.subItems.filter((sub) => !sub.roles || sub.roles.includes(role));
            return { ...item, subItems };
          }
          return item;
        })
        .filter((item) => (item.subItems && item.subItems.length > 0) || item.to);
      return { ...section, items };
    })
    .filter((section) => section.items && section.items.length > 0);
};

const ProtectedLayout = ({ children, allowedRoles, bodyActions }) => {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAppContext();
  const userRole = user?.userType;

  const navSections = useMemo(() => filterSectionsByRole(NAV_SECTIONS, userRole), [userRole]);

  if (isLoading) {
    return (
      <div className="auth-layout__loading-skeleton" role="status" aria-live="polite">
        <span className="auth-layout__loading-label">Cargando sesión…</span>
        <div className="auth-layout__loading-header">
          <div className="auth-layout__loading-logo auth-layout__skeleton-block" />
          <div className="auth-layout__loading-building">
            <span className="auth-layout__skeleton-block auth-layout__skeleton-block--md" />
            <span className="auth-layout__skeleton-block auth-layout__skeleton-block--lg" />
          </div>
          <div className="auth-layout__loading-actions">
            <span className="auth-layout__skeleton-block auth-layout__skeleton-block--pill" />
            <span className="auth-layout__skeleton-block auth-layout__skeleton-block--pill" />
            <span className="auth-layout__skeleton-block auth-layout__skeleton-block--pill" />
          </div>
        </div>
        <div className="auth-layout__loading-body">
          <aside className="auth-layout__loading-sidebar">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={`sidebar-skeleton-${index}`} className="auth-layout__loading-sidebar-item">
                <span className="auth-layout__skeleton-block auth-layout__skeleton-block--xs" />
                <span className="auth-layout__skeleton-block auth-layout__skeleton-block--md" />
              </div>
            ))}
          </aside>
          <main className="auth-layout__loading-content">
            <div className="auth-layout__loading-hero">
              <span className="auth-layout__skeleton-block auth-layout__skeleton-block--xl" />
              <span className="auth-layout__skeleton-block auth-layout__skeleton-block--lg" />
            </div>
            <div className="auth-layout__loading-metrics">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={`metric-skeleton-${index}`} className="auth-layout__loading-card">
                  <span className="auth-layout__skeleton-block auth-layout__skeleton-block--sm" />
                  <span className="auth-layout__skeleton-block auth-layout__skeleton-block--lg" />
                </div>
              ))}
            </div>
            <div className="auth-layout__loading-panels">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={`panel-skeleton-${index}`} className="auth-layout__loading-panel">
                  <span className="auth-layout__skeleton-block auth-layout__skeleton-block--md" />
                  <div className="auth-layout__loading-panel-lines">
                    <span className="auth-layout__skeleton-block auth-layout__skeleton-block--lg" />
                    <span className="auth-layout__skeleton-block auth-layout__skeleton-block--lg" />
                    <span className="auth-layout__skeleton-block auth-layout__skeleton-block--md" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
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
    <AuthLayout user={user} navSections={navSections} bodyActions={bodyActions}>
      {children}
    </AuthLayout>
  );
};

ProtectedLayout.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  bodyActions: PropTypes.node,
};

ProtectedLayout.defaultProps = {
  allowedRoles: null,
  bodyActions: null,
};

export default ProtectedLayout;

