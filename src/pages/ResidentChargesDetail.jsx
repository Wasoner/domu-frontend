import { useEffect, useState } from 'react';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import './ResidentChargesDetail.css';

/**
 * Resident Charges Detail Page Component
 * Detailed view of common charges breakdown
 */
const ResidentChargesDetail = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [charges, setCharges] = useState([]);
  const [breakdown, setBreakdown] = useState({
    total: 0,
    items: [],
  });

  useEffect(() => {
    const fetchCharges = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.finance.getMyCharges();
        setCharges(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'No pudimos cargar los gastos comunes.');
      } finally {
        setLoading(false);
      }
    };
    fetchCharges();
  }, [user]);

  useEffect(() => {
    if (selectedPeriod && charges.length > 0) {
      const charge = charges.find((c) => `${c.month}/${c.year}` === selectedPeriod);
      if (charge) {
        setBreakdown({
          total: charge.amount || 0,
          items: [
            { concept: 'Gasto común ordinario', amount: charge.amount * 0.6 },
            { concept: 'Fondo de reserva', amount: charge.amount * 0.15 },
            { concept: 'Agua caliente', amount: charge.amount * 0.1 },
            { concept: 'Calefacción', amount: charge.amount * 0.08 },
            { concept: 'Otros', amount: charge.amount * 0.07 },
          ],
        });
      }
    }
  }, [selectedPeriod, charges]);

  const formatCurrency = (value) => {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
  };

  const periods = charges.map((c) => `${c.month}/${c.year}`);

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-charges-detail">
        <header className="resident-charges-detail__header">
          <div>
            <h1>Detalle del Gasto Común</h1>
            <p className="resident-charges-detail__subtitle">Desglose completo de tus gastos mensuales</p>
          </div>
        </header>

        {error && <p className="resident-charges-detail__error">{error}</p>}

        <div className="resident-charges-detail__controls">
          <label className="resident-charges-detail__select-label">
            <span>Selecciona un período:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="resident-charges-detail__select"
            >
              <option value="">-- Seleccionar --</option>
              {periods.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="resident-charges-detail__loading">Cargando gastos...</div>
        ) : selectedPeriod && breakdown.items.length > 0 ? (
          <div className="resident-charges-detail__content">
            <div className="resident-charges-detail__total-card">
              <span className="resident-charges-detail__total-icon">🧾</span>
              <div>
                <p>Total Gasto Común - {selectedPeriod}</p>
                <strong>{formatCurrency(breakdown.total)}</strong>
              </div>
            </div>

            <section className="resident-charges-detail__breakdown">
              <h2>Desglose de Conceptos</h2>
              <ul className="resident-charges-detail__list">
                {breakdown.items.map((item, index) => (
                  <li key={index} className="resident-charges-detail__item">
                    <span className="resident-charges-detail__concept">{item.concept}</span>
                    <span className="resident-charges-detail__amount">{formatCurrency(item.amount)}</span>
                    <div className="resident-charges-detail__bar">
                      <div
                        className="resident-charges-detail__bar-fill"
                        style={{ width: `${(item.amount / breakdown.total) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <div className="resident-charges-detail__empty">
            <span className="resident-charges-detail__empty-icon">📊</span>
            <p>Selecciona un período para ver el detalle</p>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentChargesDetail;
