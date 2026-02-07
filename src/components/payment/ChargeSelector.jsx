import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../';
import './ChargeSelector.scss';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const ChargeSelector = ({
  charges,
  selectedCharges,
  onSelectionChange,
  minPaymentPercent = 0.2,
  onProceed,
  loading,
}) => {
  const [errors, setErrors] = useState({});

  const totalSelected = useMemo(() => {
    return Object.values(selectedCharges).reduce((sum, amount) => sum + (amount || 0), 0);
  }, [selectedCharges]);

  const selectedCount = useMemo(() => {
    return Object.keys(selectedCharges).filter((id) => selectedCharges[id] > 0).length;
  }, [selectedCharges]);

  const handleCheckboxChange = (charge) => {
    const chargeId = charge.chargeId || charge.id;
    const isSelected = selectedCharges[chargeId] !== undefined;

    if (isSelected) {
      const newSelection = { ...selectedCharges };
      delete newSelection[chargeId];
      onSelectionChange(newSelection);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[chargeId];
        return newErrors;
      });
    } else {
      onSelectionChange({
        ...selectedCharges,
        [chargeId]: charge.pending || charge.amount,
      });
    }
  };

  const handleAmountChange = (charge, value) => {
    const chargeId = charge.chargeId || charge.id;
    const pending = charge.pending || charge.amount;
    const minAmount = Math.ceil(pending * minPaymentPercent);
    const amount = parseInt(value, 10) || 0;

    let error = null;
    if (amount < minAmount) {
      error = `Minimo: ${formatCurrency(minAmount)} (${minPaymentPercent * 100}%)`;
    } else if (amount > pending) {
      error = `Maximo: ${formatCurrency(pending)}`;
    }

    setErrors((prev) => ({
      ...prev,
      [chargeId]: error,
    }));

    onSelectionChange({
      ...selectedCharges,
      [chargeId]: amount,
    });
  };

  const canProceed = useMemo(() => {
    if (selectedCount === 0) return false;
    if (Object.values(errors).some((e) => e !== null)) return false;
    return totalSelected > 0;
  }, [selectedCount, errors, totalSelected]);

  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
  };

  return (
    <div className="charge-selector">
      <div className="charge-selector__header">
        <h2>Selecciona los cargos a pagar</h2>
        <p>Elige los cargos pendientes y el monto que deseas abonar (minimo {minPaymentPercent * 100}%)</p>
      </div>

      <div className="charge-selector__list">
        {charges.length === 0 ? (
          <div className="charge-selector__empty">
            <Icon name="check" size={40} />
            <p>No tienes cargos pendientes</p>
          </div>
        ) : (
          charges.map((charge) => {
            const chargeId = charge.chargeId || charge.id;
            const pending = charge.pending || charge.amount;
            const isSelected = selectedCharges[chargeId] !== undefined;
            const minAmount = Math.ceil(pending * minPaymentPercent);

            return (
              <div
                key={chargeId}
                className={`charge-selector__item ${isSelected ? 'charge-selector__item--selected' : ''}`}
              >
                <label className="charge-selector__checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(charge)}
                    className="charge-selector__checkbox"
                  />
                  <span className="charge-selector__checkmark">
                    <Icon name="check" size={14} />
                  </span>
                </label>

                <div className="charge-selector__details">
                  <div className="charge-selector__title">
                    {charge.description || `Gasto Comun ${getMonthName(charge.month)} ${charge.year}`}
                  </div>
                  <div className="charge-selector__pending">
                    Pendiente: <strong>{formatCurrency(pending)}</strong>
                  </div>
                </div>

                {isSelected && (
                  <div className="charge-selector__amount-wrapper">
                    <label className="charge-selector__amount-label">
                      Monto a abonar
                    </label>
                    <div className="charge-selector__input-wrapper">
                      <span className="charge-selector__currency">$</span>
                      <input
                        type="number"
                        value={selectedCharges[chargeId] || ''}
                        onChange={(e) => handleAmountChange(charge, e.target.value)}
                        min={minAmount}
                        max={pending}
                        className={`charge-selector__input ${errors[chargeId] ? 'charge-selector__input--error' : ''}`}
                        placeholder={minAmount.toString()}
                      />
                    </div>
                    {errors[chargeId] && (
                      <span className="charge-selector__error">{errors[chargeId]}</span>
                    )}
                    <span className="charge-selector__hint">
                      Min: {formatCurrency(minAmount)}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {charges.length > 0 && (
        <div className="charge-selector__footer">
          <div className="charge-selector__summary">
            <span className="charge-selector__summary-label">
              Total a pagar ({selectedCount} {selectedCount === 1 ? 'cargo' : 'cargos'})
            </span>
            <span className="charge-selector__summary-amount">
              {formatCurrency(totalSelected)}
            </span>
          </div>
          <button
            type="button"
            className="charge-selector__proceed-btn"
            onClick={onProceed}
            disabled={!canProceed || loading}
          >
            {loading ? 'Cargando...' : 'Ir a pagar'}
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

ChargeSelector.propTypes = {
  charges: PropTypes.arrayOf(
    PropTypes.shape({
      chargeId: PropTypes.number,
      id: PropTypes.number,
      description: PropTypes.string,
      amount: PropTypes.number,
      pending: PropTypes.number,
      month: PropTypes.number,
      year: PropTypes.number,
    })
  ).isRequired,
  selectedCharges: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  minPaymentPercent: PropTypes.number,
  onProceed: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ChargeSelector;
