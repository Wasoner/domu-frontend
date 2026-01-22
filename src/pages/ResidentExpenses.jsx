import { useState } from 'react';
import { ProtectedLayout } from '../layout';
import './ResidentExpenses.css';

/**
 * Resident Expenses Page Component
 * View community expenses and financial outflows
 */
const ResidentExpenses = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-01');

  // Mock data - replace with API call
  const expenses = [
    { id: 1, category: 'Mantención', description: 'Reparación ascensores', amount: 850000, date: '2026-01-15', status: 'paid' },
    { id: 2, category: 'Servicios', description: 'Electricidad áreas comunes', amount: 425000, date: '2026-01-10', status: 'paid' },
    { id: 3, category: 'Personal', description: 'Remuneraciones conserjería', amount: 1200000, date: '2026-01-05', status: 'paid' },
    { id: 4, category: 'Servicios', description: 'Agua potable', amount: 380000, date: '2026-01-08', status: 'paid' },
    { id: 5, category: 'Mantención', description: 'Jardinería', amount: 150000, date: '2026-01-20', status: 'pending' },
    { id: 6, category: 'Seguros', description: 'Póliza incendio', amount: 520000, date: '2026-01-12', status: 'paid' },
  ];

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const paidExpenses = expenses.filter((e) => e.status === 'paid').reduce((acc, e) => acc + e.amount, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Mantención': '🔧',
      'Servicios': '💡',
      'Personal': '👤',
      'Seguros': '🛡️',
    };
    return icons[category] || '📋';
  };

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-expenses">
        <header className="resident-expenses__header">
          <div>
            <h1>Egresos</h1>
            <p className="resident-expenses__subtitle">Gastos y salidas de dinero de la comunidad</p>
          </div>
          <div className="resident-expenses__month-selector">
            <label htmlFor="month-select">Período:</label>
            <input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </header>

        <div className="resident-expenses__summary">
          <div className="resident-expenses__summary-card">
            <span className="resident-expenses__summary-icon">💸</span>
            <div>
              <p>Total egresos</p>
              <strong>{formatCurrency(totalExpenses)}</strong>
            </div>
          </div>
          <div className="resident-expenses__summary-card">
            <span className="resident-expenses__summary-icon">✅</span>
            <div>
              <p>Pagados</p>
              <strong>{formatCurrency(paidExpenses)}</strong>
            </div>
          </div>
          <div className="resident-expenses__summary-card">
            <span className="resident-expenses__summary-icon">⏳</span>
            <div>
              <p>Pendientes</p>
              <strong>{formatCurrency(totalExpenses - paidExpenses)}</strong>
            </div>
          </div>
        </div>

        <section className="resident-expenses__list-section">
          <h2>Detalle de egresos</h2>
          <div className="resident-expenses__list">
            {expenses.map((expense) => (
              <div key={expense.id} className="resident-expenses__item">
                <div className="resident-expenses__item-left">
                  <span className="resident-expenses__item-icon">{getCategoryIcon(expense.category)}</span>
                  <div>
                    <strong className="resident-expenses__item-desc">{expense.description}</strong>
                    <span className="resident-expenses__item-category">{expense.category}</span>
                  </div>
                </div>
                <div className="resident-expenses__item-right">
                  <strong className="resident-expenses__item-amount">{formatCurrency(expense.amount)}</strong>
                  <span className={`resident-expenses__item-status resident-expenses__item-status--${expense.status}`}>
                    {expense.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                  <span className="resident-expenses__item-date">
                    {new Date(expense.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </ProtectedLayout>
  );
};

export default ResidentExpenses;
