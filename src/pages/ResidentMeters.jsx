import { useState } from 'react';
import { ProtectedLayout } from '../layout';
import './ResidentMeters.scss';

/**
 * Resident Meters Page Component
 * View and register utility meter readings
 */
const ResidentMeters = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [newReading, setNewReading] = useState('');

  // Mock data - replace with API call
  const meters = [
    { id: 1, type: 'Agua caliente', unit: 'm³', lastReading: 1245.5, lastDate: '2026-01-15', icon: '🚿' },
    { id: 2, type: 'Agua fría', unit: 'm³', lastReading: 2180.2, lastDate: '2026-01-15', icon: '💧' },
    { id: 3, type: 'Gas', unit: 'm³', lastReading: 890.8, lastDate: '2026-01-15', icon: '🔥' },
    { id: 4, type: 'Calefacción', unit: 'kWh', lastReading: 3420.0, lastDate: '2026-01-15', icon: '🌡️' },
  ];

  const handleOpenRegister = (meter) => {
    setSelectedMeter(meter);
    setNewReading('');
    setShowRegisterModal(true);
  };

  const handleSubmitReading = (e) => {
    e.preventDefault();
    // TODO: API call to register reading
    console.log('Registering reading:', { meter: selectedMeter.id, reading: newReading });
    setShowRegisterModal(false);
  };

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-meters">
        <header className="resident-meters__header">
          <div>
            <h1>Medidores</h1>
            <p className="resident-meters__subtitle">Consulta y registra las lecturas de tus medidores</p>
          </div>
        </header>

        <div className="resident-meters__grid">
          {meters.map((meter) => (
            <div key={meter.id} className="resident-meters__card">
              <div className="resident-meters__card-header">
                <span className="resident-meters__card-icon">{meter.icon}</span>
                <h3>{meter.type}</h3>
              </div>
              <div className="resident-meters__reading">
                <span className="resident-meters__value">{meter.lastReading.toLocaleString('es-CL')}</span>
                <span className="resident-meters__unit">{meter.unit}</span>
              </div>
              <p className="resident-meters__date">
                Última lectura: {new Date(meter.lastDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <button
                className="resident-meters__register-btn"
                onClick={() => handleOpenRegister(meter)}
              >
                Registrar lectura
              </button>
            </div>
          ))}
        </div>

        <section className="resident-meters__info">
          <h2>¿Cómo registrar una lectura?</h2>
          <ol className="resident-meters__steps">
            <li>Localiza el medidor correspondiente en tu propiedad</li>
            <li>Toma nota del número que aparece en el display</li>
            <li>Haz clic en "Registrar lectura" del medidor correspondiente</li>
            <li>Ingresa el valor exacto que observas</li>
          </ol>
        </section>

        {/* Modal para registrar lectura */}
        {showRegisterModal && selectedMeter && (
          <div className="resident-meters__modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <div className="resident-meters__modal" onClick={(e) => e.stopPropagation()}>
              <div className="resident-meters__modal-header">
                <h2>Registrar Lectura</h2>
                <button
                  className="resident-meters__modal-close"
                  onClick={() => setShowRegisterModal(false)}
                >
                  ×
                </button>
              </div>
              <form className="resident-meters__modal-form" onSubmit={handleSubmitReading}>
                <div className="resident-meters__meter-info">
                  <span className="resident-meters__meter-icon">{selectedMeter.icon}</span>
                  <div>
                    <strong>{selectedMeter.type}</strong>
                    <p>Última lectura: {selectedMeter.lastReading} {selectedMeter.unit}</p>
                  </div>
                </div>
                <div className="resident-meters__form-group">
                  <label htmlFor="new-reading">Nueva lectura ({selectedMeter.unit})</label>
                  <input
                    id="new-reading"
                    type="number"
                    step="0.1"
                    min={selectedMeter.lastReading}
                    value={newReading}
                    onChange={(e) => setNewReading(e.target.value)}
                    placeholder={`Ej: ${selectedMeter.lastReading + 50}`}
                    required
                  />
                </div>
                <div className="resident-meters__modal-actions">
                  <button
                    type="button"
                    className="resident-meters__cancel-btn"
                    onClick={() => setShowRegisterModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="resident-meters__submit-btn">
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentMeters;
