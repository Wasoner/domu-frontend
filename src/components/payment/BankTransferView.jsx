import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../';
import useCountdown from '../../hooks/useCountdown';
import './BankTransferView.scss';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const BankTransferView = ({
  amount,
  buildingName = 'Edificio Domu',
  onComplete,
  onCancel,
  countdownSeconds = 15,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const bankData = {
    banco: 'Banco Estado',
    tipoCuenta: 'Cuenta Corriente',
    numeroCuenta: '123456789',
    rut: '76.123.456-7',
    nombre: `Administracion ${buildingName}`,
    email: 'pagos@domu.cl',
  };

  const { seconds, start } = useCountdown(countdownSeconds, onComplete);

  useEffect(() => {
    start();
  }, [start]);

  const copyToClipboard = async (text, field = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (field) {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const copyAll = () => {
    const text = `Banco: ${bankData.banco}
Tipo de Cuenta: ${bankData.tipoCuenta}
N° Cuenta: ${bankData.numeroCuenta}
RUT: ${bankData.rut}
Nombre: ${bankData.nombre}
Email: ${bankData.email}
Monto: ${formatCurrency(amount)}`;
    copyToClipboard(text);
  };

  const getCountdownColor = () => {
    if (seconds <= 3) return 'bank-transfer__countdown--danger';
    if (seconds <= 7) return 'bank-transfer__countdown--warning';
    return '';
  };

  return (
    <div className="bank-transfer">
      <div className={`bank-transfer__countdown ${getCountdownColor()}`}>
        <Icon name="clock" size={16} />
        <span>00:{seconds.toString().padStart(2, '0')}</span>
      </div>

      <div className="bank-transfer__header">
        <div className="bank-transfer__icon">
          <Icon name="buildingLibrary" size={32} />
        </div>
        <h2>Datos para Transferencia</h2>
        <p>Realiza la transferencia con los siguientes datos</p>
      </div>

      <div className="bank-transfer__data">
        {[
          { label: 'Banco', value: bankData.banco, key: 'banco' },
          { label: 'Tipo de Cuenta', value: bankData.tipoCuenta, key: 'tipo' },
          { label: 'N° Cuenta', value: bankData.numeroCuenta, key: 'cuenta' },
          { label: 'RUT', value: bankData.rut, key: 'rut' },
          { label: 'Nombre', value: bankData.nombre, key: 'nombre' },
          { label: 'Email', value: bankData.email, key: 'email' },
          { label: 'Monto', value: formatCurrency(amount), key: 'monto', highlight: true },
        ].map((item) => (
          <div key={item.key} className={`bank-transfer__row ${item.highlight ? 'bank-transfer__row--highlight' : ''}`}>
            <span className="bank-transfer__label">{item.label}</span>
            <span className="bank-transfer__value">{item.value}</span>
            <button
              type="button"
              className={`bank-transfer__copy ${copiedField === item.key ? 'bank-transfer__copy--copied' : ''}`}
              onClick={() => copyToClipboard(item.value, item.key)}
              title="Copiar"
            >
              {copiedField === item.key ? (
                <Icon name="check" size={16} />
              ) : (
                <Icon name="clipboard" size={16} />
              )}
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`bank-transfer__copy-all ${copied ? 'bank-transfer__copy-all--copied' : ''}`}
        onClick={copyAll}
      >
        {copied ? (
          <>
            <Icon name="check" size={18} />
            Copiado
          </>
        ) : (
          <>
            <Icon name="clipboard" size={18} />
            Copiar todo como texto
          </>
        )}
      </button>

      <div className="bank-transfer__notice">
        <Icon name="info" size={18} />
        <p>
          Una vez realizada la transferencia, el pago se procesara automaticamente.
          El comprobante se enviara a tu correo registrado.
        </p>
      </div>

      <button
        type="button"
        className="bank-transfer__cancel"
        onClick={onCancel}
      >
        Cancelar y volver
      </button>
    </div>
  );
};

BankTransferView.propTypes = {
  amount: PropTypes.number.isRequired,
  buildingName: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  countdownSeconds: PropTypes.number,
};

export default BankTransferView;
