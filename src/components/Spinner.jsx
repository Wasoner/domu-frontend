import PropTypes from 'prop-types';
import './Spinner.scss';

function Spinner({ label, size = 'md', inline = false, overlay = false, variant = 'primary' }) {
  return (
    <div
      className={`spinner ${inline ? 'spinner--inline' : ''} spinner--${size} ${overlay ? 'spinner--overlay' : ''} spinner--${variant}`}
      role="status"
      aria-live="polite"
    >
      <span className="spinner__circle" aria-hidden="true" />
      {label && <span className="spinner__label">{label}</span>}
    </div>
  );
}

Spinner.propTypes = {
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  inline: PropTypes.bool,
  overlay: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'white']),
};

export default Spinner;
