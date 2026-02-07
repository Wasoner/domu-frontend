import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../';
import { ROUTES } from '../../constants';
import './PaymentSuccess.scss';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const PaymentSuccess = ({
  amount,
  chargesCount,
  paymentMethod,
  redirectDelay = 3000,
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(ROUTES.RESIDENT_CHARGES_DETAIL_VIEW);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, redirectDelay]);

  const handleManualRedirect = () => {
    navigate(ROUTES.RESIDENT_CHARGES_DETAIL_VIEW);
  };

  const getMethodLabel = () => {
    if (paymentMethod === 'transfer') return 'Transferencia bancaria';
    if (paymentMethod === 'card') return 'Tarjeta de credito';
    return 'Pago online';
  };

  return (
    <div className="payment-success">
      <div className="payment-success__icon">
        <div className="payment-success__icon-circle">
          <Icon name="check" size={48} />
        </div>
      </div>

      <h2 className="payment-success__title">Pago procesado con exito</h2>

      <div className="payment-success__details">
        <div className="payment-success__detail">
          <span className="payment-success__detail-label">Monto pagado</span>
          <span className="payment-success__detail-value">{formatCurrency(amount)}</span>
        </div>
        <div className="payment-success__detail">
          <span className="payment-success__detail-label">Cargos abonados</span>
          <span className="payment-success__detail-value">
            {chargesCount} {chargesCount === 1 ? 'cargo' : 'cargos'}
          </span>
        </div>
        <div className="payment-success__detail">
          <span className="payment-success__detail-label">Metodo de pago</span>
          <span className="payment-success__detail-value">{getMethodLabel()}</span>
        </div>
      </div>

      <p className="payment-success__notice">
        Se ha enviado un comprobante a tu correo electronico registrado.
      </p>

      <p className="payment-success__redirect">
        Redirigiendo en {countdown} {countdown === 1 ? 'segundo' : 'segundos'}...
      </p>

      <button
        type="button"
        className="payment-success__button"
        onClick={handleManualRedirect}
      >
        <Icon name="arrowLeft" size={18} />
        Volver a gastos comunes
      </button>
    </div>
  );
};

PaymentSuccess.propTypes = {
  amount: PropTypes.number.isRequired,
  chargesCount: PropTypes.number.isRequired,
  paymentMethod: PropTypes.oneOf(['transfer', 'card']).isRequired,
  redirectDelay: PropTypes.number,
};

export default PaymentSuccess;
