import { useEffect, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { api } from '../services';
import Button from './Button';
import './VisitPanel.css';

const SUPPORTED_ROLES = ['resident', 'concierge', 'admin'];
const ROLE_LABELS = {
  resident: 'Residente',
  concierge: 'Conserje',
  admin: 'Administrador',
};

const initialFormState = {
  firstName: '',
  paternalLastName: '',
  maternalLastName: '',
  rut: '',
  validForMinutes: 120,
  unit: '',
};

const formatDate = (isoString) => {
  try {
    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return 'Fecha no disponible';
  }
};

const normalizeRut = (rut) => rut.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

const rutIsValid = (rut) => /^[0-9]{7,8}-[\dK]$/i.test(normalizeRut(rut));

const buildVisitorName = (formData) => `${formData.firstName} ${formData.paternalLastName} ${formData.maternalLastName}`.replace(/\s+/g, ' ').trim();

const statusLabel = (status) => {
  const normalized = (status || 'SCHEDULED').toUpperCase();
  if (normalized === 'CHECKED_IN') return 'Ingresada';
  if (normalized === 'EXPIRED') return 'Expirada';
  return 'Agendada';
};

const VisitRegistrationPanel = ({ user }) => {
  const resolvedRole = useMemo(() => {
    if (!user) return undefined;
    if (user.userType) return user.userType;
    if (user.roleId === 1) return 'admin';
    if (user.roleId === 3) return 'concierge';
    return 'resident';
  }, [user]);

  const [formData, setFormData] = useState(initialFormState);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canRegister = SUPPORTED_ROLES.includes(resolvedRole);
  const hasUnit = resolvedRole === 'resident' ? Boolean(user?.unitId) : Boolean(formData.unit);

  const fetchVisits = useCallback(async () => {
    if (!user) return;
    setLoadingVisits(true);
    try {
      const response = await api.visits.listMine();
      setUpcomingVisits(response?.upcoming || []);
      setPastVisits(response?.past || []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos cargar tus visitas.' });
    } finally {
      setLoadingVisits(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchVisits();
    }
  }, [user, fetchVisits]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = setTimeout(() => setFeedback(null), 4200);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'El nombre es obligatorio.';
    if (!formData.paternalLastName.trim()) return 'El apellido paterno es obligatorio.';
    if (!formData.maternalLastName.trim()) return 'El apellido materno es obligatorio.';
    if (!formData.rut.trim()) return 'El RUT es obligatorio.';
    if (!rutIsValid(formData.rut)) return 'El RUT debe tener el formato 12345678-9.';
    if (!hasUnit) return resolvedRole === 'resident'
      ? 'No encontramos tu unidad. Actualiza tu perfil o contacta al administrador.'
      : 'Debes indicar la unidad/departamento para esta visita.';
    const minutes = Number(formData.validForMinutes);
    if (Number.isNaN(minutes) || minutes <= 0) return 'La vigencia debe ser mayor a 0 minutos.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      setFeedback({ type: 'error', message: errorMessage });
      return;
    }

    setSubmitting(true);
    try {
      await api.visits.create({
        visitorName: buildVisitorName(formData),
        visitorDocument: normalizeRut(formData.rut),
        visitorType: 'VISIT',
        validForMinutes: Number(formData.validForMinutes),
        ...(resolvedRole !== 'resident' ? { unitId: Number(formData.unit) } : {}),
      });
      setFeedback({
        type: 'success',
        message: 'Visita registrada y enviada a conserjería.',
      });
      resetForm();
      fetchVisits();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos registrar la visita.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckIn = async (authorizationId) => {
    setSubmitting(true);
    try {
      await api.visits.checkIn(authorizationId);
      setFeedback({ type: 'success', message: 'Visita marcada como ingresada.' });
      fetchVisits();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos marcar el ingreso.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="visit-panel">
        <header className="visit-panel__header">
          <div>
            <p className="visit-panel__eyebrow">Registro de visitas</p>
            <h3>Inicia sesión para anunciar accesos</h3>
          </div>
        </header>
        <p className="visit-panel__locked">
          Necesitas estar autenticado para registrar visitas y notificar a conserjería.
        </p>
      </section>
    );
  }

  if (!canRegister || !hasUnit) {
    return (
      <section className="visit-panel">
        <header className="visit-panel__header">
          <div>
            <p className="visit-panel__eyebrow">Registro de visitas</p>
            <h3>Acceso restringido</h3>
          </div>
        </header>
        <p className="visit-panel__locked">
          {!canRegister
            ? 'Tu perfil todavía no tiene permiso para anunciar visitas. Contacta al administrador para habilitarlo.'
            : 'Necesitamos una unidad asociada para enviar la visita. Actualiza tu perfil o pide apoyo al administrador.'}
        </p>
      </section>
    );
  }

  const fullNamePreview = `${formData.firstName || 'Nombre'} ${formData.paternalLastName || 'Apellido'}`.trim();

  return (
    <section className="visit-panel" aria-label="Control y registro de visitas">
      <header className="visit-panel__header">
        <div>
          <p className="visit-panel__eyebrow">Registro de visitas</p>
          <h3>Controla quién ingresa a tu comunidad</h3>
          <span className="visit-panel__helper">
            {resolvedRole === 'admin'
              ? 'Los administradores solo deben registrar visitas cuando la situación lo amerite.'
              : 'Crea el registro y comparte esta información con recepción para agilizar el ingreso.'}
          </span>
        </div>
        <div className="visit-panel__role-pill">
          Registrando como <strong>{ROLE_LABELS[resolvedRole]}</strong>
        </div>
      </header>

      {feedback && (
        <div className={`visit-panel__feedback visit-panel__feedback--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      )}

      <div className="visit-panel__layout">
        <form className="visit-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Datos de la visita</legend>
            <div className="visit-form__grid">
              <label className="visit-form__field">
                <span>Nombre</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="María"
                  required
                />
              </label>

              <label className="visit-form__field">
                <span>Apellido paterno</span>
                <input
                  type="text"
                  name="paternalLastName"
                  value={formData.paternalLastName}
                  onChange={handleChange}
                  placeholder="Soto"
                  required
                />
              </label>

              <label className="visit-form__field">
                <span>Apellido materno</span>
                <input
                  type="text"
                  name="maternalLastName"
                  value={formData.maternalLastName}
                  onChange={handleChange}
                  placeholder="Espinoza"
                  required
                />
              </label>

              <label className="visit-form__field">
                <span>RUT</span>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleChange}
                  placeholder="12345678-9"
                  required
                />
              </label>

              <label className="visit-form__field">
                <span>Vigencia (minutos)</span>
                <input
                  type="number"
                  name="validForMinutes"
                  value={formData.validForMinutes}
                  onChange={handleChange}
                  min="15"
                  step="15"
                  required
                />
              </label>

              {resolvedRole !== 'resident' && (
                <label className="visit-form__field">
                  <span>Unidad o departamento</span>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="Ej: 1502"
                    required
                  />
                </label>
              )}
            </div>
            <p className="visit-form__helper">
              {resolvedRole === 'resident'
                ? 'Usaremos tu unidad asociada automáticamente para autorizar el ingreso.'
                : 'Indica la unidad del residente para generar la autorización.'}
            </p>
          </fieldset>

          <div className="visit-form__actions">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrar visita'}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm} disabled={submitting}>
              Limpiar
            </Button>
          </div>

          <p className="visit-form__preview">
            Próxima visita: <strong>{fullNamePreview}</strong>
            {formData.validForMinutes ? ` · Vigente ${formData.validForMinutes} min` : ''}
          </p>
        </form>

        <div className="visit-panel__boards">
          <article className="visit-board">
            <header>
              <h4>Próximas visitas</h4>
              <span>{loadingVisits ? '...' : upcomingVisits.length || '0'}</span>
            </header>
            <ul className="visit-board__list">
              {upcomingVisits.length === 0 && !loadingVisits && (
                <li className="visit-board__empty">
                  <strong>¿Aún sin visitas?</strong>
                  <span>Registra desde aquí para avisar al equipo de conserjería.</span>
                </li>
              )}

              {upcomingVisits.map((visit) => (
                <li key={visit.authorizationId} className="visit-card">
                  <div>
                    <strong>{visit.visitorName}</strong>
                    <p>Unidad {visit.unitId}</p>
                    <p>Válida hasta {formatDate(visit.validUntil)}</p>
                    <small>Estado: {statusLabel(visit.status)}</small>
                  </div>
                  <button
                    type="button"
                    className="visit-card__action"
                    onClick={() => handleCheckIn(visit.authorizationId)}
                    disabled={submitting}
                  >
                    Dar ingreso
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="visit-board">
            <header>
              <h4>Visitas pasadas</h4>
              <span>{pastVisits.length}</span>
            </header>
            <ul className="visit-board__list">
              {pastVisits.map((visit) => (
                <li key={visit.authorizationId} className="visit-card visit-card--muted">
                  <div>
                    <strong>{visit.visitorName}</strong>
                    <p>Unidad {visit.unitId}</p>
                    <p>
                      {visit.checkInAt
                        ? `Ingresó el ${formatDate(visit.checkInAt)}`
                        : `Vencida el ${formatDate(visit.validUntil)}`}
                    </p>
                    <small>Estado: {statusLabel(visit.status)}</small>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
};

VisitRegistrationPanel.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    userType: PropTypes.string,
    roleId: PropTypes.number,
    unitId: PropTypes.number,
  }),
};

VisitRegistrationPanel.defaultProps = {
  user: null,
};

export default VisitRegistrationPanel;

