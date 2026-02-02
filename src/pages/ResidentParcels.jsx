import { useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { api } from '../services';
import './ResidentParcels.scss';

/**
 * Resident Parcels Page Component
 * View and manage parcel deliveries
 */
const ResidentParcels = () => {
  const { user } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [parcels, setParcels] = useState([]);
  const [unitInfo, setUnitInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unitError, setUnitError] = useState(null);

  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.parcels.listMine();
      setParcels(response || []);
    } catch (err) {
      setError(err.message || 'No pudimos cargar las encomiendas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitInfo = async () => {
    setUnitError(null);
    try {
      const response = await api.users.getMyUnit();
      setUnitInfo(response || null);
    } catch (err) {
      setUnitError(err.message || 'No pudimos cargar la unidad asociada.');
    }
  };

  useEffect(() => {
    fetchParcels();
    fetchUnitInfo();
  }, []);

  const normalizedParcels = useMemo(
    () => parcels.map((parcel) => ({
      ...parcel,
      uiStatus: parcel.status === 'COLLECTED' ? 'collected' : 'pending',
    })),
    [parcels],
  );

  const filteredParcels = filter === 'all'
    ? normalizedParcels
    : normalizedParcels.filter((p) => p.uiStatus === filter);

  const pendingCount = normalizedParcels.filter((p) => p.uiStatus === 'pending').length;

  return (
    <ProtectedLayout allowedRoles={['resident']}>
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

        {error && <p className="resident-parcels__error">{error}</p>}
        {unitError && <p className="resident-parcels__error">{unitError}</p>}
        {unitInfo && (
          <div className="resident-parcels__unit-hint">
            <strong>Tu unidad:</strong>{' '}
            {`Depto ${unitInfo.number || ''}${unitInfo.tower ? ` • Torre ${unitInfo.tower}` : ''}${unitInfo.floor ? ` • Piso ${unitInfo.floor}` : ''}`}
            {unitInfo.buildingId ? ` • Edificio ${unitInfo.buildingId}` : ''}
            {user?.selectedBuildingId && unitInfo.buildingId && user.selectedBuildingId !== unitInfo.buildingId && (
              <span className="resident-parcels__unit-warning">
                Edificio seleccionado no coincide con tu unidad.
              </span>
            )}
          </div>
        )}

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

        {loading ? (
          <div className="resident-parcels__empty">
            <span className="resident-parcels__empty-icon">📦</span>
            <p>Cargando encomiendas...</p>
          </div>
        ) : filteredParcels.length === 0 ? (
          <div className="resident-parcels__empty">
            <span className="resident-parcels__empty-icon">📦</span>
            <p>No hay encomiendas en esta categoría</p>
          </div>
        ) : (
          <div className="resident-parcels__grid">
            {filteredParcels.map((parcel) => (
              <div key={parcel.id} className={`resident-parcels__card ${parcel.uiStatus === 'pending' ? 'is-pending' : ''}`}>
                <div className="resident-parcels__card-header">
                  <span className="resident-parcels__card-icon">
                    {parcel.uiStatus === 'pending' ? '📬' : '📦'}
                  </span>
                  <span className={`resident-parcels__status resident-parcels__status--${parcel.uiStatus}`}>
                    {parcel.uiStatus === 'pending' ? 'Por retirar' : 'Retirada'}
                  </span>
                </div>
                <h3 className="resident-parcels__sender">{parcel.sender}</h3>
                <p className="resident-parcels__description">{parcel.description}</p>
                <p className="resident-parcels__date">
                  Recibido: {parcel.receivedAt
                    ? new Date(parcel.receivedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Sin fecha'}
                </p>
                {parcel.retrievedAt && (
                  <p className="resident-parcels__date">
                    Retirado: {new Date(parcel.retrievedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
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
