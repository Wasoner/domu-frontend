
import Spinner from './Spinner';
import './Button.scss';

/**
 * Button Component
 * A reusable button component demonstrating component structure
 */
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'default', 
  disabled = false, 
  loading = false,
  type = 'button', 
  fullWidth = false, 
  icon = null, 
  className = '' 
}) => {
  const normalizedSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : size;
  const sizeClass = normalizedSize !== 'default' ? `btn--${normalizedSize}` : '';
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';
  const loadingClass = loading ? 'btn--loading' : '';

  const spinnerVariant = (variant === 'primary' || variant === 'secondary' || variant === 'danger') ? 'white' : 'primary';
  const spinnerSize = normalizedSize === 'small' ? 'sm' : 'sm'; // Small buttons get small spinner, others get small too to fit

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${sizeClass} ${fullWidthClass} ${loadingClass} ${className}`.trim()}
    >
      {loading ? (
        <Spinner variant={spinnerVariant} size={spinnerSize} inline />
      ) : (
        <>
          {icon && <span className="btn__icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};


export default Button;
