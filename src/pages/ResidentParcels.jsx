import { useState } from 'react';
import { ProtectedLayout } from '../layout';
import './ResidentParcels.scss';

/**
 * Resident Parcels Page Component
 * View and manage parcel deliveries
 */
const ResidentParcels = () => {
  const [filter, setFilter] = useState('all');

  // Mock data - replace with API call
  const parcels = [
    { id: 1, sender: 'Amazon', date: '2026-01-20', status: 'pending', description: 'Paquete pequeño' },
    { id: 2, sender: 'MercadoLibre', date: '2026-01-18', status: 'collected', description: 'Caja mediana' },
    { id: 3, sender: 'Correos de Chile', date: '2026-01-15', status: 'collected', description: 'Sobre certificado' },
    { id: 4, sender: 'Falabella', date: '2026-01-22', status: 'pending', description: 'Paquete grande' },
  ];

  const filteredParcels = filter === 'all' 
    ? parcels 
    : parcels.filter((p) => p.status === filter);

  const pendingCount = parcels.filter((p) => p.status === 'pending').length;

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge']}>
      <article className="resident-parcels">
        <header className="resident-parcels__header">
          <div>
            <h1>Encomiendas</h1>
            <p className="resident-parcels__subtitle">Gestiona tus paquetes y entregas</p>
          </div>
          {pendingCount > 0 && (
            <div className="resident-parcels__badge">
              <span>{pendingCount}</span> por retirar
            </div>
          )}
        </header>

        <div className="resident-parcels__filters">
          <button
            className={`resident-parcels__filter-btn ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`resident-parcels__filter-btn ${filter === 'pending' ? 'is-active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Por retirar
          </button>
          <button
            className={`resident-parcels__filter-btn ${filter === 'collected' ? 'is-active' : ''}`}
            onClick={() => setFilter('collected')}
          >
            Retiradas
          </button>
        </div>

        {filteredParcels.length === 0 ? (
          <div className="resident-parcels__empty">
            <span className="resident-parcels__empty-icon">📦</span>
            <p>No hay encomiendas en esta categoría</p>
          </div>
        ) : (
          <div className="resident-parcels__grid">
            {filteredParcels.map((parcel) => (
              <div key={parcel.id} className={`resident-parcels__card ${parcel.status === 'pending' ? 'is-pending' : ''}`}>
                <div className="resident-parcels__card-header">
                  <span className="resident-parcels__card-icon">
                    {parcel.status === 'pending' ? '📬' : '📦'}
                  </span>
                  <span className={`resident-parcels__status resident-parcels__status--${parcel.status}`}>
                    {parcel.status === 'pending' ? 'Por retirar' : 'Retirada'}
                  </span>
                </div>
                <h3 className="resident-parcels__sender">{parcel.sender}</h3>
                <p className="resident-parcels__description">{parcel.description}</p>
                <p className="resident-parcels__date">
                  Recibido: {new Date(parcel.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {parcel.status === 'pending' && (
                  <button className="resident-parcels__collect-btn">
                    Marcar como retirada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentParcels;
