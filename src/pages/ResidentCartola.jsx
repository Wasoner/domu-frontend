import { useEffect, useState } from 'react';
import { useAppContext } from '../context';
import { ProtectedLayout } from '../layout';
import { api } from '../services';
import './ResidentCartola.scss';

/**
 * Resident Cartola Page Component
 * Account statement and financial summary for residents
 */
const ResidentCartola = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartola, setCartola] = useState({
    balance: 0,
    lastPayment: null,
    movements: [],
  });

  useEffect(() => {
    const fetchCartola = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.finance.getMyCharges();
        const movements = Array.isArray(data) ? data : [];
        const totalPending = movements.reduce((acc, m) => acc + (Number(m.pending) || 0), 0);
        const lastPaid = movements.find((m) => Number(m.paid) > 0);
        setCartola({
          balance: totalPending,
          lastPayment: lastPaid ? { date: `${lastPaid.month}/${lastPaid.year}`, amount: lastPaid.paid } : null,
          movements,
        });
      } catch (err) {
        setError(err.message || 'No pudimos cargar tu cartola.');
      } finally {
        setLoading(false);
      }
    };
    fetchCartola();
  }, [user]);

  const formatCurrency = (value) => {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(safe);
  };

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-cartola page-shell">
        <header className="resident-cartola__header">
          <div>
            <h1>Cartola</h1>
            <p className="resident-cartola__subtitle">Estado de cuenta y movimientos financieros</p>
          </div>
        </header>

        {error && <p className="resident-cartola__error">{error}</p>}

        {loading ? (
          <>
            <div className="resident-cartola__summary resident-cartola__summary--skeleton" aria-hidden="true">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={`summary-skeleton-${index}`} className="resident-cartola__card resident-cartola__card--skeleton">
                  <span className="resident-cartola__skeleton-circle" />
                  <div className="resident-cartola__skeleton-lines">
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--sm" />
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--lg" />
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--xs" />
                  </div>
                </div>
              ))}
            </div>
            <section className="resident-cartola__movements resident-cartola__movements--skeleton" aria-hidden="true">
              <div className="resident-cartola__skeleton-title">
                <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--md" />
              </div>
              <div className="resident-cartola__table-skeleton">
                <div className="resident-cartola__table-skeleton-row resident-cartola__table-skeleton-row--header">
                  {Array.from({ length: 6 }, (_, index) => (
                    <span key={`head-skeleton-${index}`} className="resident-cartola__skeleton-block resident-cartola__skeleton-block--xs" />
                  ))}
                </div>
                {Array.from({ length: 4 }, (_, rowIndex) => (
                  <div key={`row-skeleton-${rowIndex}`} className="resident-cartola__table-skeleton-row">
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--sm" />
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--md" />
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--sm" />
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--sm" />
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--sm" />
                    <span className="resident-cartola__skeleton-block resident-cartola__skeleton-block--xs" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="resident-cartola__summary">
              <div className="resident-cartola__card resident-cartola__card--balance">
                <span className="resident-cartola__card-icon">💳</span>
                <div>
                  <p className="resident-cartola__card-label">Saldo pendiente</p>
                  <strong className="resident-cartola__card-value">{formatCurrency(cartola.balance)}</strong>
                </div>
              </div>
              {cartola.lastPayment && (
                <div className="resident-cartola__card">
                  <span className="resident-cartola__card-icon">✅</span>
                  <div>
                    <p className="resident-cartola__card-label">Último pago</p>
                    <strong className="resident-cartola__card-value">{formatCurrency(cartola.lastPayment.amount)}</strong>
                    <span className="resident-cartola__card-date">{cartola.lastPayment.date}</span>
                  </div>
                </div>
              )}
            </div>

            <section className="resident-cartola__movements">
              <h2>Movimientos</h2>
              {cartola.movements.length === 0 ? (
                <div className="resident-cartola__empty">
                  <span className="resident-cartola__empty-icon">📋</span>
                  <p>No hay movimientos registrados</p>
                </div>
              ) : (
                <table className="resident-cartola__table">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Descripción</th>
                      <th>Monto</th>
                      <th>Pagado</th>
                      <th>Pendiente</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartola.movements.map((mov) => (
                      <tr key={mov.chargeId}>
                        <td>{mov.month}/{mov.year}</td>
                        <td>{mov.description}</td>
                        <td>{formatCurrency(mov.amount)}</td>
                        <td className="resident-cartola__paid">{formatCurrency(mov.paid)}</td>
                        <td className="resident-cartola__pending">{formatCurrency(mov.pending)}</td>
                        <td>
                          <span className={`resident-cartola__status resident-cartola__status--${(mov.status || '').toLowerCase()}`}>
                            {mov.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentCartola;
