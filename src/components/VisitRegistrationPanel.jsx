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
  validFrom: '',
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

const parseNameParts = (fullName) => {
  const parts = (fullName || '').split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const paternalLastName = parts.shift() || '';
  const maternalLastName = parts.join(' ');
  return { firstName, paternalLastName, maternalLastName };
};

const toIsoOrUndefined = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
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
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveContact, setSaveContact] = useState(false);

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

  const persistContact = async (contact) => {
    try {
      await api.visits.contacts.create(contact);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos guardar el contacto.' });
    }
  };

  const fetchContacts = useCallback(async (searchTerm = '') => {
    if (!user) return;
    setLoadingContacts(true);
    try {
      const response = await api.visits.contacts.list(searchTerm || '', 5);
      setContacts(response || []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos cargar contactos.' });
    } finally {
      setLoadingContacts(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchVisits();
      fetchContacts();
    }
  }, [user, fetchVisits, fetchContacts]);

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

  const handleSaveContactToggle = (event) => {
    setSaveContact(event.target.checked);
  };

  const handleContactSearchChange = (event) => {
    setContactSearch(event.target.value);
  };

  const handleContactSearchSubmit = async (event) => {
    event.preventDefault();
    fetchContacts(contactSearch);
  };

  const handleReRegister = (visit) => {
    const parsed = parseNameParts(visit.visitorName);
    setFormData((prev) => ({
      ...prev,
      ...parsed,
      rut: visit.visitorDocument || '',
      unit: resolvedRole !== 'resident' ? (visit.unitId || '') : prev.unit,
      validFrom: '',
      validForMinutes: 120,
    }));
    setFeedback({ type: 'success', message: `Listo para re-registrar a ${visit.visitorName}` });
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
    if (formData.validFrom) {
      const startDate = new Date(formData.validFrom);
      if (Number.isNaN(startDate.getTime())) return 'La fecha de inicio no es válida.';
    }
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
      const payload = {
        visitorName: buildVisitorName(formData),
        visitorDocument: normalizeRut(formData.rut),
        visitorType: 'VISIT',
        validForMinutes: Number(formData.validForMinutes),
        ...(formData.validFrom ? { validFrom: toIsoOrUndefined(formData.validFrom) } : {}),
        ...(resolvedRole !== 'resident' ? { unitId: Number(formData.unit) } : {}),
      };
      await api.visits.create(payload);
      if (saveContact) {
        await persistContact({
          visitorName: buildVisitorName(formData),
          visitorDocument: normalizeRut(formData.rut),
          unitId: resolvedRole !== 'resident' ? Number(formData.unit) || undefined : user?.unitId || undefined,
        });
        fetchContacts(contactSearch);
      }
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

  const handleDeleteContact = async (contact) => {
    try {
      await api.visits.contacts.delete(contact.id);
      fetchContacts(contactSearch);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No pudimos eliminar el contacto.' });
    }
  };

  const handleLoadContact = (contact) => {
    const parsed = parseNameParts(contact.visitorName);
    setFormData((prev) => ({
      ...prev,
      ...parsed,
      rut: contact.visitorDocument || '',
      unit: resolvedRole !== 'resident' ? (contact.unitId || '') : prev.unit,
      validFrom: '',
      validForMinutes: 120,
    }));
    setFeedback({ type: 'success', message: `Contacto cargado: ${contact.visitorName}` });
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

              <label className="visit-form__field">
                <span>Fecha y hora de inicio</span>
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  aria-label="Fecha y hora de inicio de la visita"
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
              <label className="visit-form__save-contact">
                <input
                  type="checkbox"
                  name="saveContact"
                  checked={saveContact}
                  onChange={handleSaveContactToggle}
                />
                Guardar como contacto
              </label>
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
              <span>{Math.min(pastVisits.length, 5)}</span>
            </header>
            <ul className="visit-board__list">
              {pastVisits.slice(0, 5).map((visit) => (
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

          <article className="visit-board visit-board--history">
            <header className="visit-board__header">
              <div>
                <h4>Visitas guardadas</h4>
                <p className="visit-board__helper">Frecuentes / plantillas (máx. 5)</p>
              </div>
              <form className="visit-history__form" onSubmit={handleContactSearchSubmit}>
                <input
                  type="search"
                  className="visit-history__input"
                  name="contactSearch"
                  value={contactSearch}
                  onChange={handleContactSearchChange}
                  placeholder="Ej: Juan o 12345678-9"
                  aria-label="Buscar contactos"
                />
                <Button type="submit" variant="secondary" disabled={loadingContacts}>
                  {loadingContacts ? 'Buscando...' : 'Buscar'}
                </Button>
              </form>
            </header>
            <ul className="visit-board__list">
              {loadingContacts && (
                <li className="visit-board__empty">Buscando visitas guardadas...</li>
              )}
              {!loadingContacts && contacts.length === 0 && (
                <li className="visit-board__empty">
                  <strong>Sin visitas guardadas</strong>
                  <span>Guarda desde el formulario con “Guardar como contacto”.</span>
                </li>
              )}
              {contacts.slice(0, 5).map((contact) => (
                <li key={contact.id} className="visit-card visit-card--muted">
                  <button
                    type="button"
                    className="visit-card__delete"
                    aria-label="Eliminar contacto"
                    onClick={() => handleDeleteContact(contact)}
                    disabled={submitting}
                  >
                    🗑️
                  </button>
                  <div>
                    <strong>{contact.visitorName}</strong>
                    {contact.visitorDocument && <p>RUT {contact.visitorDocument}</p>}
                    {contact.unitId && <p>Unidad {contact.unitId}</p>}
                    {contact.alias && <p>Alias: {contact.alias}</p>}
                  </div>
                  <div className="visit-card__actions">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleLoadContact(contact)}
                      disabled={submitting}
                    >
                      Cargar en formulario
                    </Button>
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

