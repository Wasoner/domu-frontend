import PropTypes from 'prop-types';
import './FormField.scss';

const FormField = ({
  label,
  hint,
  error,
  id,
  name,
  type = 'text',
  as = 'input',
  size = 'md',
  className = '',
  inputClassName = '',
  children,
  control,
  ...rest
}) => {
  const fieldId = id || name;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const Control = as;

  return (
    <div
      className={`form-field form-field--${size} ${error ? 'form-field--error' : ''} ${className}`.trim()}
    >
      {label && (
        <label className="form-field__label" htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div className="form-field__control">
        {control || (
          <Control
            id={fieldId}
            name={name}
            type={type}
            className={`form-field__input ${inputClassName}`.trim()}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            {...rest}
          >
            {children}
          </Control>
        )}
      </div>
      {hint && (
        <small className="form-field__hint" id={hintId}>
          {hint}
        </small>
      )}
      {error && (
        <small className="form-field__error" id={errorId} role="alert">
          {error}
        </small>
      )}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  control: PropTypes.node,
  children: PropTypes.node,
};

export default FormField;
