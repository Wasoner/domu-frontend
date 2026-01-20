import { useCallback, useEffect, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { api } from '../services';
import './AdminAmenities.css';

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const defaultAmenityForm = () => ({
  name: '',
  description: '',
  maxCapacity: '',
  costPerSlot: '',
  rules: '',
  imageUrl: '',
  status: 'ACTIVE',
});

const defaultSlotForm = () => ({
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '11:00',
  active: true,
});

const AdminAmenities = () => {
  const { user } = useAppContext();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [reservations, setReservations] = useState([]);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 3;

  // Form state
  const [form, setForm] = useState(defaultAmenityForm);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState(defaultSlotForm);

  const fetchAmenities = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.amenities.listAll();
      setAmenities(data?.amenities || []);
    } catch (err) {
      setError(err.message || 'No pudimos cargar las áreas comunes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const handleCreateNew = () => {
    setEditingAmenity(null);
    setForm(defaultAmenityForm());
    setCurrentStep(1);
    setShowForm(true);
  };

  const handleEdit = (amenity) => {
    setEditingAmenity(amenity);
    setForm({
      name: amenity.name || '',
      description: amenity.description || '',
      maxCapacity: amenity.maxCapacity || '',
      costPerSlot: amenity.costPerSlot || '',
      rules: amenity.rules || '',
      imageUrl: amenity.imageUrl || '',
      status: amenity.status || 'ACTIVE',
    });
    setCurrentStep(1);
    setShowForm(true);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return form.name.trim().length > 0;
      case 2:
        return true; // Opcional
      case 3:
        return true; // Opcional
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep) && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setError('El nombre es obligatorio');
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingAmenity) {
        await api.amenities.update(editingAmenity.id, form);
      } else {
        await api.amenities.create(form);
      }
      setShowForm(false);
      setForm(defaultAmenityForm());
      setEditingAmenity(null);
      setCurrentStep(1);
      fetchAmenities();
    } catch (err) {
      setError(err.message || 'No pudimos guardar el área común');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (amenityId) => {
    if (!window.confirm('¿Seguro que deseas desactivar esta área común?')) return;
    setLoading(true);
    try {
      await api.amenities.delete(amenityId);
      fetchAmenities();
    } catch (err) {
      setError(err.message || 'No pudimos eliminar el área común');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureSlots = (amenity) => {
    setSelectedAmenity(amenity);
    setSlots(amenity.timeSlots || []);
    setNewSlot(defaultSlotForm());
    setShowSlotForm(true);
  };

  const handleAddSlot = () => {
    setSlots([...slots, { ...newSlot, id: `new-${Date.now()}` }]);
    setNewSlot(defaultSlotForm());
  };

  const handleRemoveSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSaveSlots = async () => {
    if (!selectedAmenity) return;
    setLoading(true);
    setError(null);
    try {
      await api.amenities.configureTimeSlots(selectedAmenity.id, slots);
      setShowSlotForm(false);
      setSelectedAmenity(null);
      fetchAmenities();
    } catch (err) {
      setError(err.message || 'No pudimos guardar los horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReservations = async (amenity) => {
    setSelectedAmenity(amenity);
    setLoading(true);
    try {
      const data = await api.amenities.getReservations(amenity.id);
      setReservations(data?.reservations || []);
      setShowReservations(true);
    } catch (err) {
      setError(err.message || 'No pudimos cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    setLoading(true);
    try {
      await api.reservations.cancel(reservationId);
      if (selectedAmenity) {
        const data = await api.amenities.getReservations(selectedAmenity.id);
        setReservations(data?.reservations || []);
      }
    } catch (err) {
      setError(err.message || 'No pudimos cancelar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentStep(1);
    setForm(defaultAmenityForm());
    setEditingAmenity(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  const renderStepIndicator = () => (
    <div className="stepper">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`stepper__step ${currentStep === step ? 'stepper__step--active' : ''} ${currentStep > step ? 'stepper__step--completed' : ''}`}
        >
          <div className="stepper__circle">{currentStep > step ? '✓' : step}</div>
          <span className="stepper__label">
            {step === 1 && 'Información básica'}
            {step === 2 && 'Detalles'}
            {step === 3 && 'Configuración'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="step-content__title">Información básica</h3>
            <p className="step-content__subtitle">Define el nombre y descripción del área común</p>
            
            <label className="form-field">
              <span className="form-field__label">Nombre del área *</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={150}
                placeholder="Ej: Quincho, Piscina, Sala de eventos"
                className="form-field__input"
              />
            </label>

            <label className="form-field">
              <span className="form-field__label">Descripción</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder="Describe el área, sus características y equipamiento disponible"
                className="form-field__textarea"
              />
            </label>

            <label className="form-field">
              <span className="form-field__label">URL de imagen</span>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="form-field__input"
              />
              {form.imageUrl && (
                <div className="form-field__preview">
                  <img src={form.imageUrl} alt="Vista previa" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </label>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3 className="step-content__title">Detalles del espacio</h3>
            <p className="step-content__subtitle">Configura capacidad, costos y reglas de uso</p>

            <div className="form-row">
              <label className="form-field">
                <span className="form-field__label">Capacidad máxima</span>
                <input
                  type="number"
                  value={form.maxCapacity}
                  onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
                  min={1}
                  placeholder="Ej: 20"
                  className="form-field__input"
                />
                <span className="form-field__hint">Número de personas permitidas</span>
              </label>

              <label className="form-field">
                <span className="form-field__label">Costo por reserva ($)</span>
                <input
                  type="number"
                  value={form.costPerSlot}
                  onChange={(e) => setForm({ ...form, costPerSlot: e.target.value })}
                  min={0}
                  step="100"
                  placeholder="0 = Gratis"
                  className="form-field__input"
                />
                <span className="form-field__hint">Deja en 0 si es gratis</span>
              </label>
            </div>

            <label className="form-field">
              <span className="form-field__label">Reglas de uso</span>
              <textarea
                value={form.rules}
                onChange={(e) => setForm({ ...form, rules: e.target.value })}
                rows={5}
                placeholder="Ingresa las reglas y condiciones de uso del espacio. Por ejemplo:&#10;- No se permite música después de las 22:00&#10;- Máximo de invitados: 30 personas&#10;- El residente es responsable de la limpieza"
                className="form-field__textarea"
              />
            </label>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3 className="step-content__title">Configuración final</h3>
            <p className="step-content__subtitle">Define el estado del área común</p>

            <label className="form-field">
              <span className="form-field__label">Estado</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="form-field__select"
              >
                <option value="ACTIVE">Activa - Disponible para reservas</option>
                <option value="MAINTENANCE">En mantenimiento - No disponible temporalmente</option>
                <option value="INACTIVE">Inactiva - Deshabilitada</option>
              </select>
            </label>

            <div className="summary-card">
              <h4>Resumen</h4>
              <div className="summary-card__content">
                <div className="summary-card__item">
                  <span className="summary-card__label">Nombre:</span>
                  <span className="summary-card__value">{form.name || '-'}</span>
                </div>
                {form.description && (
                  <div className="summary-card__item">
                    <span className="summary-card__label">Descripción:</span>
                    <span className="summary-card__value">{form.description.substring(0, 100)}{form.description.length > 100 ? '...' : ''}</span>
                  </div>
                )}
                {form.maxCapacity && (
                  <div className="summary-card__item">
                    <span className="summary-card__label">Capacidad:</span>
                    <span className="summary-card__value">{form.maxCapacity} personas</span>
                  </div>
                )}
                <div className="summary-card__item">
                  <span className="summary-card__label">Costo:</span>
                  <span className="summary-card__value">
                    {form.costPerSlot > 0 ? `$${Number(form.costPerSlot).toLocaleString('es-CL')}` : 'Gratis'}
                  </span>
                </div>
                <div className="summary-card__item">
                  <span className="summary-card__label">Estado:</span>
                  <span className={`summary-card__status summary-card__status--${form.status.toLowerCase()}`}>
                    {form.status === 'ACTIVE' ? 'Activa' : form.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Inactiva'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedLayout allowedRoles={['admin', 'concierge']}>
      <article className="admin-amenities">
        <header className="admin-amenities__header">
          <div>
            <p className="admin-amenities__eyebrow">Gestión</p>
            <h1>Áreas Comunes</h1>
            <p className="admin-amenities__subtitle">
              Crea, configura y administra las áreas comunes de tu comunidad.
            </p>
          </div>
          <div className="admin-amenities__actions">
            <button type="button" onClick={fetchAmenities} disabled={loading}>
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
            <button type="button" className="primary" onClick={handleCreateNew}>
              + Nueva área
            </button>
          </div>
        </header>

        {error && <div className="admin-amenities__error">{error}</div>}

        <section className="admin-amenities__list">
          {loading && amenities.length === 0 && (
            <div className="admin-amenities__empty">Cargando áreas comunes...</div>
          )}
          {!loading && amenities.length === 0 && (
            <div className="admin-amenities__empty">
              No hay áreas comunes registradas. Crea la primera.
            </div>
          )}

          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className={`amenity-card ${amenity.status !== 'ACTIVE' ? 'amenity-card--inactive' : ''}`}
            >
              <div className="amenity-card__header">
                <h3>{amenity.name}</h3>
                <span className={`amenity-card__status amenity-card__status--${amenity.status?.toLowerCase()}`}>
                  {amenity.status === 'ACTIVE' ? 'Activa' : amenity.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Inactiva'}
                </span>
              </div>

              {amenity.description && (
                <p className="amenity-card__description">{amenity.description}</p>
              )}

              <div className="amenity-card__meta">
                {amenity.maxCapacity && (
                  <span>Capacidad: {amenity.maxCapacity} personas</span>
                )}
                {amenity.costPerSlot > 0 && (
                  <span>Costo: ${Number(amenity.costPerSlot).toLocaleString('es-CL')}</span>
                )}
              </div>

              <div className="amenity-card__slots">
                <strong>Horarios configurados:</strong>
                {(!amenity.timeSlots || amenity.timeSlots.length === 0) ? (
                  <span className="amenity-card__no-slots">Sin horarios</span>
                ) : (
                  <div className="amenity-card__slots-list">
                    {amenity.timeSlots.slice(0, 4).map((slot) => (
                      <span key={slot.id} className="amenity-card__slot-chip">
                        {slot.dayName} {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                      </span>
                    ))}
                    {amenity.timeSlots.length > 4 && (
                      <span className="amenity-card__slot-chip">+{amenity.timeSlots.length - 4} más</span>
                    )}
                  </div>
                )}
              </div>

              <div className="amenity-card__actions">
                <button type="button" onClick={() => handleEdit(amenity)}>Editar</button>
                <button type="button" onClick={() => handleConfigureSlots(amenity)}>Horarios</button>
                <button type="button" onClick={() => handleViewReservations(amenity)}>Reservas</button>
                {amenity.status === 'ACTIVE' && (
                  <button type="button" className="danger" onClick={() => handleDelete(amenity.id)}>
                    Desactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Modal: Crear/Editar Área con Stepper */}
        {showForm && (
          <div className="modal modal--large" role="dialog" aria-modal="true">
            <div className="modal__card modal__card--stepper">
              <header className="modal__header">
                <h2>{editingAmenity ? 'Editar área común' : 'Nueva área común'}</h2>
                <button type="button" className="modal__close" onClick={handleCloseForm}>✕</button>
              </header>

              {renderStepIndicator()}

              <form className="stepper-form" onSubmit={handleSave}>
                {renderStepContent()}

                <div className="stepper-form__actions">
                  {currentStep > 1 && (
                    <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                      ← Anterior
                    </button>
                  )}
                  <div className="stepper-form__spacer" />
                  {currentStep < TOTAL_STEPS ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleNextStep}
                      disabled={!validateStep(currentStep)}
                    >
                      Siguiente →
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary btn-primary--success" disabled={loading}>
                      {loading ? 'Guardando...' : editingAmenity ? 'Actualizar área' : 'Crear área'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Configurar Horarios */}
        {showSlotForm && selectedAmenity && (
          <div className="modal modal--large" role="dialog" aria-modal="true">
            <div className="modal__card modal__card--wide">
              <header className="modal__header">
                <h2>Configurar horarios: {selectedAmenity.name}</h2>
                <button type="button" className="modal__close" onClick={() => setShowSlotForm(false)}>✕</button>
              </header>
              <div className="slot-form">
                <div className="slot-form__add">
                  <h4>Agregar bloque horario</h4>
                  <div className="slot-form__row">
                    <select
                      value={newSlot.dayOfWeek}
                      onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: Number(e.target.value) })}
                    >
                      {DAY_NAMES.slice(1).map((day, index) => (
                        <option key={index + 1} value={index + 1}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    />
                    <span>a</span>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    />
                    <button type="button" className="btn-primary" onClick={handleAddSlot}>
                      + Agregar
                    </button>
                  </div>
                </div>

                <div className="slot-form__list">
                  <h4>Bloques configurados ({slots.length})</h4>
                  {slots.length === 0 && (
                    <p className="slot-form__empty">No hay bloques horarios. Agrega al menos uno.</p>
                  )}
                  {slots.map((slot, index) => (
                    <div key={slot.id || index} className="slot-form__item">
                      <span className="slot-form__day">{DAY_NAMES[slot.dayOfWeek]}</span>
                      <span className="slot-form__time">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                      <button type="button" className="btn-danger-small" onClick={() => handleRemoveSlot(index)}>
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>

                <div className="slot-form__actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowSlotForm(false)}>Cancelar</button>
                  <button type="button" className="btn-primary" onClick={handleSaveSlots} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar horarios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Ver Reservas */}
        {showReservations && selectedAmenity && (
          <div className="modal modal--large" role="dialog" aria-modal="true">
            <div className="modal__card modal__card--wide">
              <header className="modal__header">
                <h2>Reservas: {selectedAmenity.name}</h2>
                <button type="button" className="modal__close" onClick={() => setShowReservations(false)}>✕</button>
              </header>
              <div className="reservations-list">
                {reservations.length === 0 && (
                  <p className="reservations-list__empty">No hay reservas registradas.</p>
                )}
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`reservation-item reservation-item--${reservation.status?.toLowerCase()}`}
                  >
                    <div className="reservation-item__info">
                      <strong>{reservation.userName || 'Usuario'}</strong>
                      <span>{reservation.userEmail}</span>
                    </div>
                    <div className="reservation-item__date">
                      <span>{formatDate(reservation.reservationDate)}</span>
                      <span>{formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}</span>
                    </div>
                    <div className="reservation-item__status">
                      <span className={`status-badge status-badge--${reservation.status?.toLowerCase()}`}>
                        {reservation.status === 'CONFIRMED' ? 'Confirmada' : reservation.status === 'CANCELLED' ? 'Cancelada' : reservation.status}
                      </span>
                    </div>
                    {reservation.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        className="btn-danger-small"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default AdminAmenities;
