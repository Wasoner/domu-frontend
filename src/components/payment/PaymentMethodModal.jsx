import PropTypes from 'prop-types';
import { Icon } from '../';
import './PaymentMethodModal.scss';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentMethodModal = ({
  open,
  totalAmount,
  onSelectTransfer,
  onSelectCard,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="payment-method-modal__overlay" onClick={onCancel}>
      <div className="payment-method-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="payment-method-modal__close"
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <Icon name="close" size={20} />
        </button>

        <div className="payment-method-modal__header">
          <h2>Selecciona tu metodo de pago</h2>
          <p className="payment-method-modal__total">
            Total a pagar: <strong>{formatCurrency(totalAmount)}</strong>
          </p>
        </div>

        <div className="payment-method-modal__options">
          <button
            type="button"
            className="payment-method-modal__option"
            onClick={onSelectTransfer}
          >
            <div className="payment-method-modal__option-icon payment-method-modal__option-icon--transfer">
              <Icon name="buildingLibrary" size={32} />
            </div>
            <div className="payment-method-modal__option-content">
              <span className="payment-method-modal__option-title">Transferencia Bancaria</span>
              <span className="payment-method-modal__option-desc">
                Transfiere desde tu banco
              </span>
            </div>
            <Icon name="chevronRight" size={20} className="payment-method-modal__option-arrow" />
          </button>

          <button
            type="button"
            className="payment-method-modal__option"
            onClick={onSelectCard}
          >
            <div className="payment-method-modal__option-icon payment-method-modal__option-icon--card">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div className="payment-method-modal__option-content">
              <span className="payment-method-modal__option-title">Tarjeta de Credito/Debito</span>
              <span className="payment-method-modal__option-desc">
                Visa, Mastercard, American Express
              </span>
            </div>
            <Icon name="chevronRight" size={20} className="payment-method-modal__option-arrow" />
          </button>
        </div>

        <div className="payment-method-modal__footer">
          <button
            type="button"
            className="payment-method-modal__cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

PaymentMethodModal.propTypes = {
  open: PropTypes.bool.isRequired,
  totalAmount: PropTypes.number.isRequired,
  onSelectTransfer: PropTypes.func.isRequired,
  onSelectCard: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PaymentMethodModal;
