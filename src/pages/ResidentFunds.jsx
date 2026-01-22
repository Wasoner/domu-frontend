import { ProtectedLayout } from '../layout';
import './ResidentFunds.css';

/**
 * Resident Funds Page Component
 * View community reserve funds and special funds
 */
const ResidentFunds = () => {
  // Mock data - replace with API call
  const funds = [
    {
      id: 1,
      name: 'Fondo de Reserva',
      balance: 15420000,
      target: 20000000,
      description: 'Para mantenciones mayores y emergencias',
      icon: '🏦',
      lastUpdate: '2026-01-15',
    },
    {
      id: 2,
      name: 'Fondo de Reparaciones',
      balance: 3850000,
      target: 5000000,
      description: 'Reparaciones programadas del edificio',
      icon: '🔧',
      lastUpdate: '2026-01-15',
    },
    {
      id: 3,
      name: 'Fondo Legal',
      balance: 1200000,
      target: 2000000,
      description: 'Gastos legales y asesorías',
      icon: '⚖️',
      lastUpdate: '2026-01-15',
    },
    {
      id: 4,
      name: 'Fondo de Mejoras',
      balance: 2100000,
      target: 8000000,
      description: 'Proyectos de mejora aprobados en asamblea',
      icon: '✨',
      lastUpdate: '2026-01-15',
    },
  ];

  const totalFunds = funds.reduce((acc, f) => acc + f.balance, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
  };

  const getProgress = (balance, target) => {
    return Math.min((balance / target) * 100, 100);
  };

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-funds">
        <header className="resident-funds__header">
          <div>
            <h1>Fondos</h1>
            <p className="resident-funds__subtitle">Estado de los fondos de la comunidad</p>
          </div>
        </header>

        <div className="resident-funds__total">
          <span className="resident-funds__total-icon">💰</span>
          <div>
            <p>Total en fondos</p>
            <strong>{formatCurrency(totalFunds)}</strong>
          </div>
        </div>

        <div className="resident-funds__grid">
          {funds.map((fund) => (
            <div key={fund.id} className="resident-funds__card">
              <div className="resident-funds__card-header">
                <span className="resident-funds__card-icon">{fund.icon}</span>
                <h3>{fund.name}</h3>
              </div>
              <p className="resident-funds__card-desc">{fund.description}</p>
              
              <div className="resident-funds__balance">
                <span className="resident-funds__balance-current">{formatCurrency(fund.balance)}</span>
                <span className="resident-funds__balance-target">de {formatCurrency(fund.target)}</span>
              </div>

              <div className="resident-funds__progress">
                <div
                  className="resident-funds__progress-bar"
                  style={{ width: `${getProgress(fund.balance, fund.target)}%` }}
                />
              </div>
              <div className="resident-funds__progress-label">
                <span>{getProgress(fund.balance, fund.target).toFixed(0)}% completado</span>
              </div>

              <p className="resident-funds__update">
                Actualizado: {new Date(fund.lastUpdate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>

        <section className="resident-funds__info">
          <h2>¿Qué son los fondos de la comunidad?</h2>
          <p>
            Los fondos son reservas de dinero destinadas a cubrir gastos específicos de la comunidad.
            Cada fondo tiene un propósito definido y una meta de ahorro establecida por la asamblea de copropietarios.
          </p>
          <ul>
            <li><strong>Fondo de Reserva:</strong> Obligatorio por ley, destinado a cubrir emergencias y mantenciones mayores.</li>
            <li><strong>Fondos Especiales:</strong> Creados por acuerdo de asamblea para proyectos específicos.</li>
          </ul>
        </section>
      </article>
    </ProtectedLayout>
  );
};

export default ResidentFunds;
