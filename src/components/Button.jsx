import PropTypes from 'prop-types';
import './Button.scss';

/**
 * Button Component
 * A reusable button component demonstrating component structure
 */
const Button = ({ children, onClick, variant = 'primary', size = 'default', disabled = false, type = 'button', fullWidth = false, icon = null, className = '' }) => {
  const normalizedSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : size;
  const sizeClass = normalizedSize !== 'default' ? `btn--${normalizedSize}` : '';
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['small', 'sm', 'default', 'large', 'lg']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default Button;
