import { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../';
import CreditCardSVG from './CreditCardSVG';
import './CardPaymentView.scss';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const CardPaymentView = ({ amount, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const handleChange = (field, value) => {
    let formattedValue = value;

    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'cardHolder') {
      formattedValue = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');

    if (cardNumberClean.length < 15) {
      newErrors.cardNumber = 'Numero de tarjeta invalido';
    }

    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'Ingresa el nombre del titular';
    }

    if (formData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Fecha invalida';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const expMonth = parseInt(month, 10);
      const expYear = parseInt(`20${year}`, 10);
      const now = new Date();
      const expDate = new Date(expYear, expMonth - 1);

      if (expMonth < 1 || expMonth > 12) {
        newErrors.expiryDate = 'Mes invalido';
      } else if (expDate < now) {
        newErrors.expiryDate = 'Tarjeta expirada';
      }
    }

    if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    // Simular procesamiento de 2.5 segundos
    await new Promise((resolve) => setTimeout(resolve, 2500));

    onComplete();
  };

  return (
    <div className="card-payment">
      <div className="card-payment__header">
        <h2>Pago con Tarjeta</h2>
        <p>Ingresa los datos de tu tarjeta</p>
      </div>

      <div className="card-payment__card-wrapper">
        <CreditCardSVG
          cardNumber={formData.cardNumber}
          cardHolder={formData.cardHolder}
          expiryDate={formData.expiryDate}
          cvv={formData.cvv}
          isFlipped={isFlipped}
        />
      </div>

      <form onSubmit={handleSubmit} className="card-payment__form">
        <div className="card-payment__field">
          <label htmlFor="cardNumber">Numero de tarjeta</label>
          <input
            id="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={(e) => handleChange('cardNumber', e.target.value)}
            placeholder="1234 5678 9012 3456"
            className={errors.cardNumber ? 'card-payment__input--error' : ''}
            disabled={loading}
            autoComplete="cc-number"
          />
          {errors.cardNumber && (
            <span className="card-payment__error">{errors.cardNumber}</span>
          )}
        </div>

        <div className="card-payment__field">
          <label htmlFor="cardHolder">Nombre en la tarjeta</label>
          <input
            id="cardHolder"
            type="text"
            value={formData.cardHolder}
            onChange={(e) => handleChange('cardHolder', e.target.value)}
            placeholder="NOMBRE APELLIDO"
            className={errors.cardHolder ? 'card-payment__input--error' : ''}
            disabled={loading}
            autoComplete="cc-name"
          />
          {errors.cardHolder && (
            <span className="card-payment__error">{errors.cardHolder}</span>
          )}
        </div>

        <div className="card-payment__row">
          <div className="card-payment__field">
            <label htmlFor="expiryDate">Fecha de expiracion</label>
            <input
              id="expiryDate"
              type="text"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              className={errors.expiryDate ? 'card-payment__input--error' : ''}
              disabled={loading}
              autoComplete="cc-exp"
            />
            {errors.expiryDate && (
              <span className="card-payment__error">{errors.expiryDate}</span>
            )}
          </div>

          <div className="card-payment__field">
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              type="text"
              value={formData.cvv}
              onChange={(e) => handleChange('cvv', e.target.value)}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              placeholder="123"
              className={errors.cvv ? 'card-payment__input--error' : ''}
              disabled={loading}
              autoComplete="cc-csc"
            />
            {errors.cvv && (
              <span className="card-payment__error">{errors.cvv}</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="card-payment__submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="card-payment__spinner" />
              Procesando pago...
            </>
          ) : (
            <>
              <Icon name="lock" size={18} />
              Pagar {formatCurrency(amount)}
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        className="card-payment__cancel"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar y volver
      </button>

      <div className="card-payment__secure">
        <Icon name="shieldCheck" size={16} />
        <span>Pago seguro encriptado</span>
      </div>
    </div>
  );
};

CardPaymentView.propTypes = {
  amount: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CardPaymentView;
