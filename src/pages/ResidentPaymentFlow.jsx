import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedLayout } from '../layout';
import { Icon, Skeleton } from '../components';
import {
  ChargeSelector,
  PaymentMethodModal,
  BankTransferView,
  CardPaymentView,
  PaymentSuccess,
} from '../components/payment';
import { useAppContext } from '../context';
import { api } from '../services';
import { ROUTES } from '../constants';
import './ResidentPaymentFlow.scss';

const ResidentPaymentFlow = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  // Flow state
  const [step, setStep] = useState('select'); // select, method, transfer, card, success
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [charges, setCharges] = useState([]);
  const [selectedCharges, setSelectedCharges] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showMethodModal, setShowMethodModal] = useState(false);

  // Load pending charges
  const loadCharges = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const myCharges = await api.finance.getMyCharges();
      // Filter only charges with pending amount
      const pendingCharges = (myCharges || []).filter(
        (c) => (c.pending || c.amount - (c.paid || 0)) > 0
      );
      setCharges(pendingCharges);
    } catch (err) {
      console.error('Error loading charges:', err);
      setError('No se pudieron cargar los cargos pendientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCharges();
  }, [loadCharges]);

  // Calculate totals
  const totalSelected = useMemo(() => {
    return Object.values(selectedCharges).reduce((sum, amount) => sum + (amount || 0), 0);
  }, [selectedCharges]);

  const selectedCount = useMemo(() => {
    return Object.keys(selectedCharges).filter((id) => selectedCharges[id] > 0).length;
  }, [selectedCharges]);

  // Handlers
  const handleProceedToMethod = () => {
    if (selectedCount === 0) return;
    setShowMethodModal(true);
  };

  const handleSelectTransfer = () => {
    setPaymentMethod('transfer');
    setShowMethodModal(false);
    setStep('transfer');
  };

  const handleSelectCard = () => {
    setPaymentMethod('card');
    setShowMethodModal(false);
    setStep('card');
  };

  const handlePaymentComplete = async () => {
    try {
      // Map method to readable label
      const methodLabel = paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta';

      // Call simulated payment for each selected charge with amount and method
      const entries = Object.entries(selectedCharges);
      for (const [chargeId, amount] of entries) {
        await api.finance.paySimulated(chargeId, amount, methodLabel);
      }
      setStep('success');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Error al procesar el pago. Intenta nuevamente.');
      setStep('select');
    }
  };

  const handleCancel = () => {
    if (step === 'select') {
      navigate(ROUTES.RESIDENT_CHARGES_DETAIL_VIEW);
    } else {
      setStep('select');
      setPaymentMethod(null);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.RESIDENT_CHARGES_DETAIL_VIEW);
  };

  // Render content based on step
  const renderContent = () => {
    if (loading) {
      return (
        <div className="payment-flow__loading">
          <Skeleton.List rows={4} />
        </div>
      );
    }

    if (error && step === 'select') {
      return (
        <div className="payment-flow__error">
          <Icon name="exclamationTriangle" size={40} />
          <p>{error}</p>
          <button type="button" onClick={loadCharges}>
            Reintentar
          </button>
        </div>
      );
    }

    switch (step) {
      case 'select':
        return (
          <ChargeSelector
            charges={charges}
            selectedCharges={selectedCharges}
            onSelectionChange={setSelectedCharges}
            minPaymentPercent={0.2}
            onProceed={handleProceedToMethod}
            loading={loading}
          />
        );

      case 'transfer':
        return (
          <BankTransferView
            amount={totalSelected}
            buildingName={user?.buildingName || 'Tu Edificio'}
            onComplete={handlePaymentComplete}
            onCancel={handleCancel}
            countdownSeconds={15}
          />
        );

      case 'card':
        return (
          <CardPaymentView
            amount={totalSelected}
            onComplete={handlePaymentComplete}
            onCancel={handleCancel}
          />
        );

      case 'success':
        return (
          <PaymentSuccess
            amount={totalSelected}
            chargesCount={selectedCount}
            paymentMethod={paymentMethod}
            redirectDelay={3000}
          />
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'select':
        return 'Pagar Gastos Comunes';
      case 'transfer':
        return 'Transferencia Bancaria';
      case 'card':
        return 'Pago con Tarjeta';
      case 'success':
        return 'Pago Exitoso';
      default:
        return 'Pago';
    }
  };

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin']}>
      <div className="payment-flow page-shell">
        <header className="payment-flow__header">
          {step !== 'success' && (
            <button
              type="button"
              className="payment-flow__back"
              onClick={handleBack}
            >
              <Icon name="arrowLeft" size={20} />
              <span>Volver</span>
            </button>
          )}
          <h1>{getStepTitle()}</h1>
        </header>

        <div className="payment-flow__content">
          {renderContent()}
        </div>

        <PaymentMethodModal
          open={showMethodModal}
          totalAmount={totalSelected}
          onSelectTransfer={handleSelectTransfer}
          onSelectCard={handleSelectCard}
          onCancel={() => setShowMethodModal(false)}
        />
      </div>
    </ProtectedLayout>
  );
};

export default ResidentPaymentFlow;
