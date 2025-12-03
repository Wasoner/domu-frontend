import PropTypes from 'prop-types';
import AuthHeader from './AuthHeader';
import Sidebar from './Sidebar';
import './AuthLayout.css';

const AuthLayout = ({ user, children }) => {
  return (
    <div className="auth-layout">
      <AuthHeader user={user} />
      <div className="auth-layout__body">
        <Sidebar user={user} />
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
  children: PropTypes.node.isRequired,
};

AuthLayout.defaultProps = {
  user: null,
};

export default AuthLayout;

