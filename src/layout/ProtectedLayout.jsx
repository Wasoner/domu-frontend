import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '.';
import { useAppContext } from '../context';
import { Skeleton } from '../components';
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
        {/* Header skeleton */}
        <div className="auth-layout__loading-header">
          <Skeleton variant="rect" width="120px" height="32px" borderRadius="var(--radius-sm, 6px)" />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Skeleton variant="text" width="100px" />
            <Skeleton variant="text" width="140px" />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Skeleton variant="rect" width="80px" height="28px" borderRadius="var(--radius-pill, 9999px)" />
            <Skeleton variant="rect" width="80px" height="28px" borderRadius="var(--radius-pill, 9999px)" />
            <Skeleton variant="circle" width="32px" height="32px" />
          </div>
        </div>
        {/* Body skeleton */}
        <div className="auth-layout__loading-body">
          <aside className="auth-layout__loading-sidebar">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={`sidebar-skeleton-${index}`} className="auth-layout__loading-sidebar-item">
                <Skeleton variant="rect" width="20px" height="20px" borderRadius="var(--radius-xs, 4px)" />
                <Skeleton variant="text" width={index % 3 === 0 ? '70%' : '55%'} />
              </div>
            ))}
          </aside>
          <main className="auth-layout__loading-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <Skeleton variant="title" width="30%" />
              <Skeleton variant="text" width="50%" />
            </div>
            <Skeleton.Stats count={3} />
            <div style={{ marginTop: '1.5rem' }}>
              <Skeleton.List rows={4} />
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

