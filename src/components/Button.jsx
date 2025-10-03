/**
 * Button Component
 * A reusable button component demonstrating component structure
 */
const Button = ({ children, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

export default Button;
