import { useCallback, useEffect, useState } from 'react';
import { ProtectedLayout } from '../layout';
import { useAppContext } from '../context';
import { api } from '../services';
import './ResidentAmenities.scss';

const ResidentAmenities = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('amenities'); // 'amenities' | 'my-reservations'
  const [amenities, setAmenities] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservationNotes, setReservationNotes] = useState('');

  const fetchAmenities = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.amenities.list();
      setAmenities(data?.amenities || []);
    } catch (err) {
      setError(err.message || 'No pudimos cargar las áreas comunes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMyReservations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.reservations.listMine();
      setMyReservations(data?.reservations || []);
    } catch (err) {
      setError(err.message || 'No pudimos cargar tus reservas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'amenities') {
      fetchAmenities();
    } else {
      fetchMyReservations();
    }
  }, [activeTab, fetchAmenities, fetchMyReservations]);

  const handleOpenReserve = (amenity) => {
    setSelectedAmenity(amenity);
    setSelectedDate(getTodayString());
    setAvailability(null);
    setSelectedSlot(null);
    setReservationNotes('');
    setShowReserveModal(true);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (!selectedAmenity || !date) return;

    setLoading(true);
    try {
      const data = await api.amenities.getAvailability(selectedAmenity.id, date);
      setAvailability(data);
    } catch (err) {
      setError(err.message || 'No pudimos cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedAmenity || !selectedSlot || !selectedDate) return;

    setLoading(true);
    setError(null);
    try {
      await api.amenities.reserve(selectedAmenity.id, {
        timeSlotId: selectedSlot.slotId,
        reservationDate: selectedDate,
        notes: reservationNotes,
      });
      setShowReserveModal(false);
      setSelectedAmenity(null);
      setActiveTab('my-reservations');
      fetchMyReservations();
    } catch (err) {
      setError(err.message || 'No pudimos completar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta reserva?')) return;

    setLoading(true);
    try {
      await api.reservations.cancel(reservationId);
      fetchMyReservations();
    } catch (err) {
      setError(err.message || 'No pudimos cancelar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  const isDatePast = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const upcomingReservations = myReservations.filter(
    (r) => r.status === 'CONFIRMED' && !isDatePast(r.reservationDate)
  );
  const pastReservations = myReservations.filter(
    (r) => r.status !== 'CONFIRMED' || isDatePast(r.reservationDate)
  );

  return (
    <ProtectedLayout allowedRoles={['resident', 'admin', 'concierge', 'staff']}>
      <article className="resident-amenities page-shell">
        <header className="resident-amenities__header">
          <div>
            <p className="resident-amenities__eyebrow">Comunidad</p>
            <h1>Áreas Comunes</h1>
            <p className="resident-amenities__subtitle">
              Reserva espacios comunes de tu comunidad.
            </p>
          </div>
        </header>

        {error && <div className="resident-amenities__error">{error}</div>}

        <div className="resident-amenities__tabs" role="tablist">
          <button
            type="button"
            className={`tab ${activeTab === 'amenities' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('amenities')}
            role="tab"
            aria-selected={activeTab === 'amenities'}
          >
            Espacios disponibles
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'my-reservations' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('my-reservations')}
            role="tab"
            aria-selected={activeTab === 'my-reservations'}
          >
            Mis reservas ({upcomingReservations.length})
          </button>
        </div>

        {activeTab === 'amenities' && (
          <section className="amenities-grid">
            {loading && amenities.length === 0 && (
              <>
                {[0, 1, 2].map((key) => (
                  <div key={key} className="amenity-preview amenity-preview--skeleton" aria-hidden="true">
                    <div className="amenity-preview__image" />
                    <div className="amenity-preview__content">
                      <span className="amenities-skeleton-block amenities-skeleton-block--lg" />
                      <span className="amenities-skeleton-block amenities-skeleton-block--md" />
                      <span className="amenities-skeleton-block amenities-skeleton-block--sm" />
                      <div className="amenities-skeleton-row">
                        <span className="amenities-skeleton-block amenities-skeleton-block--xs" />
                        <span className="amenities-skeleton-block amenities-skeleton-block--xs" />
                      </div>
                      <span className="amenities-skeleton-block amenities-skeleton-block--md" />
                    </div>
                  </div>
                ))}
              </>
            )}
            {!loading && amenities.length === 0 && (
              <div className="amenities-grid__empty">
                No hay áreas comunes disponibles en tu comunidad.
              </div>
            )}

            {amenities.map((amenity) => (
              <div key={amenity.id} className="amenity-preview">
                {amenity.imageUrl && (
                  <div className="amenity-preview__image">
                    <img src={amenity.imageUrl} alt={amenity.name} />
                  </div>
                )}
                <div className="amenity-preview__content">
                  <h3>{amenity.name}</h3>
                  {amenity.description && (
                    <p className="amenity-preview__description">{amenity.description}</p>
                  )}
                  <div className="amenity-preview__meta">
                    {amenity.maxCapacity && (
                      <span>Capacidad: {amenity.maxCapacity}</span>
                    )}
                    {amenity.costPerSlot > 0 ? (
                      <span>Costo: ${Number(amenity.costPerSlot).toLocaleString('es-CL')}</span>
                    ) : (
                      <span className="amenity-preview__free">Gratis</span>
                    )}
                  </div>
                  {amenity.rules && (
                    <details className="amenity-preview__rules">
                      <summary>Ver reglas de uso</summary>
                      <p>{amenity.rules}</p>
                    </details>
                  )}
                  <button
                    type="button"
                    className="amenity-preview__reserve"
                    onClick={() => handleOpenReserve(amenity)}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'my-reservations' && (
          <section className="my-reservations">
            {loading && myReservations.length === 0 && (
              <div className="my-reservations__skeleton" aria-hidden="true">
                {[0, 1, 2].map((key) => (
                  <div key={key} className="reservation-card reservation-card--skeleton">
                    <div className="reservation-card__main">
                      <span className="amenities-skeleton-block amenities-skeleton-block--md" />
                      <span className="amenities-skeleton-block amenities-skeleton-block--sm" />
                    </div>
                    <div className="reservation-card__actions">
                      <span className="amenities-skeleton-block amenities-skeleton-block--xs" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && myReservations.length === 0 && (
              <div className="my-reservations__empty">
                No tienes reservas registradas. ¡Reserva un espacio!
              </div>
            )}

            {upcomingReservations.length > 0 && (
              <>
                <h3 className="my-reservations__section-title">Próximas reservas</h3>
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="reservation-card">
                    <div className="reservation-card__main">
                      <h4>{reservation.amenityName}</h4>
                      <p className="reservation-card__date">{formatDate(reservation.reservationDate)}</p>
                      <p className="reservation-card__time">
                        {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                      </p>
                      {reservation.notes && (
                        <p className="reservation-card__notes">"{reservation.notes}"</p>
                      )}
                    </div>
                    <div className="reservation-card__actions">
                      <span className="status-badge status-badge--confirmed">Confirmada</span>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {pastReservations.length > 0 && (
              <>
                <h3 className="my-reservations__section-title my-reservations__section-title--past">
                  Historial
                </h3>
                {pastReservations.map((reservation) => (
                  <div key={reservation.id} className="reservation-card reservation-card--past">
                    <div className="reservation-card__main">
                      <h4>{reservation.amenityName}</h4>
                      <p className="reservation-card__date">{formatDate(reservation.reservationDate)}</p>
                      <p className="reservation-card__time">
                        {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                      </p>
                    </div>
                    <div className="reservation-card__actions">
                      <span className={`status-badge status-badge--${reservation.status?.toLowerCase()}`}>
                        {reservation.status === 'CANCELLED' ? 'Cancelada' : reservation.status === 'COMPLETED' ? 'Completada' : 'Pasada'}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>
        )}

        {/* Modal: Reservar */}
        {showReserveModal && selectedAmenity && (
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal__card">
              <header className="modal__header">
                <h2>Reservar: {selectedAmenity.name}</h2>
                <button type="button" className="modal__close" onClick={() => setShowReserveModal(false)}>
                  ✕
                </button>
              </header>
              <div className="reserve-form">
                <label className="reserve-form__field">
                  <span>Fecha</span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={getTodayString()}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </label>

                {availability && (
                  <div className="reserve-form__slots">
                    <span className="reserve-form__label">
                      Horarios disponibles para {availability.dayName}:
                    </span>
                    {availability.slots.length === 0 && (
                      <p className="reserve-form__no-slots">
                        No hay horarios configurados para este día.
                      </p>
                    )}
                    <div className="slots-grid">
                      {availability.slots.map((slot) => (
                        <button
                          key={slot.slotId}
                          type="button"
                          className={`slot-btn ${!slot.available ? 'slot-btn--unavailable' : ''} ${selectedSlot?.slotId === slot.slotId ? 'slot-btn--selected' : ''}`}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <span className="slot-btn__time">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                          {!slot.available && (
                            <span className="slot-btn__reserved">Reservado</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSlot && (
                  <label className="reserve-form__field">
                    <span>Notas (opcional)</span>
                    <textarea
                      value={reservationNotes}
                      onChange={(e) => setReservationNotes(e.target.value)}
                      placeholder="Ej: Cumpleaños, reunión familiar..."
                      rows={2}
                    />
                  </label>
                )}

                <div className="reserve-form__summary">
                  {selectedSlot && (
                    <p>
                      <strong>Resumen:</strong> {selectedAmenity.name} el {formatDate(selectedDate)},{' '}
                      {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                      {selectedAmenity.costPerSlot > 0 && (
                        <> - Costo: ${Number(selectedAmenity.costPerSlot).toLocaleString('es-CL')}</>
                      )}
                    </p>
                  )}
                </div>

                <div className="reserve-form__actions">
                  <button type="button" onClick={() => setShowReserveModal(false)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={handleReserve}
                    disabled={!selectedSlot || loading}
                  >
                    {loading ? 'Reservando...' : 'Confirmar reserva'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </ProtectedLayout>
  );
};

export default ResidentAmenities;
