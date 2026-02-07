import PropTypes from 'prop-types';
import { Icon, Button } from './index';
import './ConfirmModal.scss';

/**
 * ConfirmModal - Modal de confirmación reutilizable
 * Reemplaza window.confirm() con un modal visual consistente
 */
const ConfirmModal = ({
    open,
    title = '¿Estás seguro?',
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    icon,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    const iconName = icon || (variant === 'danger' ? 'exclamationTriangle' : 'questionMarkCircle');

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-modal__icon confirm-modal__icon--${variant}`}>
                    <Icon name={iconName} size={28} />
                </div>
                <h3 className="confirm-modal__title">{title}</h3>
                {message && <p className="confirm-modal__message">{message}</p>}
                <div className="confirm-modal__actions">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};

ConfirmModal.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    variant: PropTypes.oneOf(['danger', 'warning', 'info']),
    icon: PropTypes.string,
    loading: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ConfirmModal;
