import PropTypes from 'prop-types';
import './Button.scss';

/**
 * Button Component
 * A reusable button component demonstrating component structure
 */
const Button = ({ children, onClick, variant = 'primary', size = 'default', disabled = false, type = 'button' }) => {
  const sizeClass = size !== 'default' ? `btn--${size}` : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${sizeClass}`.trim()}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
