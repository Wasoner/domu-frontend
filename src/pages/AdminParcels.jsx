import { useEffect, useMemo, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { api } from '../services';
import './AdminParcels.scss';

const STATUS_LABELS = {
  PENDING: 'Por retirar',
  COLLECTED: 'Retirada',
};

const formatUnitLabel = (parcel) => {
  if (!parcel) return 'Unidad';
  const tower = parcel.unitTower ? `Torre ${parcel.unitTower}` : null;
  const floor = parcel.unitFloor ? `Piso ${parcel.unitFloor}` : null;
  const parts = [tower, floor].filter(Boolean);
  const suffix = parts.length > 0 ? ` • ${parts.join(' ')}` : '';
  return `Depto ${parcel.unitNumber || ''}${suffix}`.trim();
};

const normalizeStatus = (status) => {
  if (!status) return 'all';
  return status.toUpperCase();
};

const AdminParcels = () => {
  const { user, buildingVersion } = useAppContext();
  const [parcels, setParcels] = useState([]);
  const [units, setUnits] = useState([]);
  const [filter, setFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    unitId: '',
    sender: '',
    description: '',
    receivedAt: '',
  });

  const fetchUnits = async () => {
    if (!user) {
      setUnits([]);
      return;
    }
    try {
      const response = await api.housingUnits.list();
      const normalized = (response || [])
        .map((item) => item?.unit || item)
        .filter((unit) => unit && unit.id);
      setUnits(normalized);
    } catch (err) {
      setError(err.message || 'No pudimos cargar las unidades.');
    }
  };

  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filter === 'all' ? undefined : normalizeStatus(filter);
      const unitId = unitFilter === 'all' ? undefined : Number(unitFilter);
      const response = await api.parcels.listAdmin({ status, unitId });
      setParcels(response || []);
    } catch (err) {
      setError(err.message || 'No pudimos cargar las encomiendas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [user, buildingVersion]);

  useEffect(() => {
    fetchParcels();
  }, [filter, unitFilter]);

  const pendingCount = useMemo(
    () => parcels.filter((parcel) => parcel.status === 'PENDING').length,
    [parcels],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const resolvedReceivedAt = formData.receivedAt
        ? (formData.receivedAt.length === 16 ? `${formData.receivedAt}:00` : formData.receivedAt)
        : null;
      const payload = {
        unitId: Number(formData.unitId),
        sender: formData.sender,
        description: formData.description,
        receivedAt: resolvedReceivedAt,
      };
      if (editingId) {
        await api.parcels.update(editingId, payload);
        setSuccessMessage('Encomienda actualizada correctamente.');
      } else {
        await api.parcels.create(payload);
        setSuccessMessage('Encomienda registrada y notificada a los residentes.');
      }
      setFormData({ unitId: '', sender: '', description: '', receivedAt: '' });
      setEditingId(null);
      fetchParcels();
    } catch (err) {
      setError(err.message || 'No pudimos registrar la encomienda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (parcel) => {
    const receivedAt = parcel.receivedAt
      ? new Date(parcel.receivedAt).toISOString().slice(0, 16)
      : '';
    setFormData({
      unitId: parcel.unitId ? String(parcel.unitId) : '',
      sender: parcel.sender || '',
      description: parcel.description || '',
      receivedAt,
    });
    setEditingId(parcel.id);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setFormData({ unitId: '', sender: '', description: '', receivedAt: '' });
    setEditingId(null);
  };

  const handleCollect = async (parcelId) => {
    setUpdatingId(parcelId);
    setError(null);
    try {
      await api.parcels.updateStatus(parcelId, 'COLLECTED');
      fetchParcels();
    } catch (err) {
      setError(err.message || 'No pudimos marcar la encomienda como retirada.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (parcelId) => {
    const confirmDelete = window.confirm('¿Eliminar esta encomienda? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;
    setUpdatingId(parcelId);
    setError(null);
    try {
      await api.parcels.delete(parcelId);
      fetchParcels();
    } catch (err) {
      setError(err.message || 'No pudimos eliminar la encomienda.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin', 'concierge']}>
      <article className="admin-parcels">
        <header className="admin-parcels__header">
          <div>
            <h1>Encomiendas</h1>
            <p className="admin-parcels__subtitle">
              Registra encomiendas recibidas y marca su retiro
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="admin-parcels__badge">
              <span>{pendingCount}</span> por retirar
            </div>
          )}
        </header>

        {error && <p className="admin-parcels__error">{error}</p>}
        {successMessage && <p className="admin-parcels__success">{successMessage}</p>}

        <section className="admin-parcels__form-card">
          <div className="admin-parcels__form-header">
            <h2>Registrar nueva encomienda</h2>
            <p>Se notificará a los residentes de la unidad seleccionada.</p>
          </div>
          <form className="admin-parcels__form" onSubmit={handleSubmit}>
            <div className="admin-parcels__form-grid">
              <div className="admin-parcels__form-group">
                <label htmlFor="parcel-unit">Unidad</label>
                <select
                  id="parcel-unit"
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  required
                >
                  <option value="">Selecciona una unidad</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {`Depto ${unit.number || ''}${unit.tower ? ` • Torre ${unit.tower}` : ''}${unit.floor ? ` • Piso ${unit.floor}` : ''}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-parcels__form-group">
                <label htmlFor="parcel-sender">Remitente</label>
                <input
                  id="parcel-sender"
                  type="text"
                  value={formData.sender}
                  onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  placeholder="Ej: Chilexpress, Amazon, Falabella"
                  required
                />
              </div>
              <div className="admin-parcels__form-group">
                <label htmlFor="parcel-receivedAt">Fecha de recepción</label>
                <input
                  id="parcel-receivedAt"
                  type="datetime-local"
                  value={formData.receivedAt}
                  onChange={(e) => setFormData({ ...formData, receivedAt: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-parcels__form-group">
              <label htmlFor="parcel-description">Descripción</label>
              <textarea
                id="parcel-description"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej: Caja mediana, sobre certificado, paquete frágil"
                required
              />
            </div>
            <div className="admin-parcels__form-actions">
              {editingId && (
                <button
                  type="button"
                  className="admin-parcels__cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancelar edición
                </button>
              )}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Registrar encomienda'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-parcels__list">
          <div className="admin-parcels__filters">
            <button
              className={`admin-parcels__filter-btn ${filter === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              className={`admin-parcels__filter-btn ${filter === 'pending' ? 'is-active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Por retirar
            </button>
            <button
              className={`admin-parcels__filter-btn ${filter === 'collected' ? 'is-active' : ''}`}
              onClick={() => setFilter('collected')}
            >
              Retiradas
            </button>

            <select
              className="admin-parcels__unit-filter"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            >
              <option value="all">Todas las unidades</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {`Depto ${unit.number || ''}${unit.tower ? ` • Torre ${unit.tower}` : ''}${unit.floor ? ` • Piso ${unit.floor}` : ''}`}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="admin-parcels__empty">Cargando encomiendas...</div>
          ) : parcels.length === 0 ? (
            <div className="admin-parcels__empty">
              <span className="admin-parcels__empty-icon">📦</span>
              <p>No hay encomiendas para los filtros seleccionados</p>
            </div>
          ) : (
            <div className="admin-parcels__grid">
              {parcels.map((parcel) => {
                const statusKey = parcel.status || 'PENDING';
                return (
                  <div
                    key={parcel.id}
                    className={`admin-parcels__card ${statusKey === 'PENDING' ? 'is-pending' : ''}`}
                  >
                    <div className="admin-parcels__card-header">
                      <span className="admin-parcels__card-icon">
                        {statusKey === 'PENDING' ? '📬' : '📦'}
                      </span>
                      <span className={`admin-parcels__status admin-parcels__status--${statusKey.toLowerCase()}`}>
                        {STATUS_LABELS[statusKey] || 'Pendiente'}
                      </span>
                    </div>
                    <h3 className="admin-parcels__sender">{parcel.sender}</h3>
                    <p className="admin-parcels__unit">{formatUnitLabel(parcel)}</p>
                    <p className="admin-parcels__description">{parcel.description}</p>
                    <p className="admin-parcels__date">
                      Recibida: {parcel.receivedAt
                        ? new Date(parcel.receivedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Sin fecha'}
                    </p>
                    {parcel.retrievedAt && (
                      <p className="admin-parcels__date">
                        Retirada: {new Date(parcel.retrievedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {statusKey === 'PENDING' && (
                      <button
                        className="admin-parcels__collect-btn"
                        onClick={() => handleCollect(parcel.id)}
                        disabled={updatingId === parcel.id}
                      >
                        {updatingId === parcel.id ? 'Actualizando...' : 'Marcar como retirada'}
                      </button>
                    )}
                    <div className="admin-parcels__card-actions">
                      <button
                        type="button"
                        className="admin-parcels__secondary-btn"
                        onClick={() => handleEdit(parcel)}
                        disabled={updatingId === parcel.id}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="admin-parcels__secondary-btn is-danger"
                        onClick={() => handleDelete(parcel.id)}
                        disabled={updatingId === parcel.id}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </article>
    </ProtectedLayout>
  );
};

export default AdminParcels;
