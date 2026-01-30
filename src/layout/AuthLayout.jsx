import PropTypes from 'prop-types';
import AuthHeader from './AuthHeader';
import Sidebar from './Sidebar';
import './AuthLayout.css';

const AuthLayout = ({ user, children, navSections, bodyActions }) => {
  return (
    <div className="auth-layout">
      <AuthHeader user={user} />
      <div className="auth-layout__body">
        <Sidebar user={user} navSections={navSections} />
        {bodyActions}
        <div className="auth-layout__content">
          <div className="auth-layout__content-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  user: PropTypes.shape({}),
  navSections: PropTypes.arrayOf(PropTypes.shape({})),
  children: PropTypes.node.isRequired,
  bodyActions: PropTypes.node,
};

AuthLayout.defaultProps = {
  user: null,
  navSections: [],
  bodyActions: null,
};

export default AuthLayout;



